import crypto from "crypto";
import { eq } from "drizzle-orm";
import { pushSubscriptions } from "../drizzle/schema";
import { getDb } from "./db";

const b64url = (value: Buffer) => value.toString("base64url");
const fromB64url = (value: string) => Buffer.from(value, "base64url");
const hkdf = (salt: Buffer, ikm: Buffer, info: Buffer, length: number) => Buffer.from(crypto.hkdfSync("sha256", ikm, salt, info, length));

function vapidAuthorization(endpoint: string) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("VAPID keys are not configured");
  const rawPublic = fromB64url(publicKey);
  if (rawPublic.length !== 65 || rawPublic[0] !== 4) throw new Error("Invalid VAPID public key");
  const x = rawPublic.subarray(1, 33); const y = rawPublic.subarray(33, 65); const d = fromB64url(privateKey);
  const key = crypto.createPrivateKey({ key: { kty: "EC", crv: "P-256", x: b64url(x), y: b64url(y), d: b64url(d) }, format: "jwk" });
  const header = b64url(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const payload = b64url(Buffer.from(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, sub: process.env.VAPID_SUBJECT ?? "mailto:support@goldvaults.us" })));
  const signature = crypto.sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `vapid t=${header}.${payload}.${b64url(signature)}, k=${publicKey}`;
}

function encryptPayload(p256dh: string, auth: string, payload: string) {
  const receiverPublic = fromB64url(p256dh); const authSecret = fromB64url(auth);
  const ecdh = crypto.createECDH("prime256v1"); ecdh.generateKeys();
  const senderPublic = ecdh.getPublicKey(); const sharedSecret = ecdh.computeSecret(receiverPublic);
  const authPrk = crypto.createHmac("sha256", authSecret).update(sharedSecret).digest();
  const ikm = hkdf(Buffer.alloc(0), authPrk, Buffer.concat([Buffer.from("WebPush: info\0"), receiverPublic, senderPublic]), 32);
  const salt = crypto.randomBytes(16);
  const cek = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const cipher = crypto.createCipheriv("aes-128-gcm", cek, nonce);
  const ciphertext = Buffer.concat([cipher.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);
  const recordSize = Buffer.alloc(4); recordSize.writeUInt32BE(4096);
  return Buffer.concat([salt, recordSize, Buffer.from([senderPublic.length]), senderPublic, ciphertext]);
}

export async function sendPushToUser(userId: number, payload: { title: string; body: string; url?: string; tag?: string }) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return { sent: 0, disabled: true };
  const db = await getDb(); if (!db) return { sent: 0, disabled: false };
  const subscriptions = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  let sent = 0;
  await Promise.allSettled(subscriptions.map(async (subscription) => {
    const body = encryptPayload(subscription.p256dh, subscription.auth, JSON.stringify(payload));
    const response = await fetch(subscription.endpoint, { method: "POST", headers: { Authorization: vapidAuthorization(subscription.endpoint), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "normal" }, body, signal: AbortSignal.timeout(10_000) });
    if (response.status === 404 || response.status === 410) await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subscription.id));
    if (!response.ok) throw new Error(`Push endpoint returned ${response.status}`);
    sent += 1;
  }));
  return { sent, disabled: false };
}

export function generateVapidKeys() {
  const ecdh = crypto.createECDH("prime256v1"); ecdh.generateKeys();
  return { publicKey: b64url(ecdh.getPublicKey()), privateKey: b64url(ecdh.getPrivateKey()) };
}
