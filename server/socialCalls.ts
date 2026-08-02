import crypto from "node:crypto";
import { TRPCError } from "@trpc/server";

export type SocialCallKind = "audio" | "video";
export type SocialCallStatus = "ringing" | "accepted" | "declined" | "ended" | "missed";

interface SocialCallCandidate {
  id: string;
  fromUserId: number;
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
}

interface SocialCallRecord {
  id: string;
  fromUserId: number;
  toUserId: number;
  kind: SocialCallKind;
  status: SocialCallStatus;
  offer: string | null;
  answer: string | null;
  candidates: SocialCallCandidate[];
  createdAt: Date;
  updatedAt: Date;
}

// Calls are intentionally ephemeral. Media flows peer-to-peer through WebRTC;
// the application server keeps only short-lived signaling data.
const calls = new Map<string, SocialCallRecord>();
const lastCallStartedAt = new Map<number, number>();
const ACTIVE_CALL_TTL_MS = 30 * 60_000;
const FINISHED_CALL_TTL_MS = 60_000;

function cleanCalls() {
  const now = Date.now();
  for (const [userId, startedAt] of Array.from(lastCallStartedAt.entries())) {
    if (now - startedAt > 60 * 60_000) lastCallStartedAt.delete(userId);
  }
  for (const [id, call] of Array.from(calls.entries())) {
    const ttl = ["ringing", "accepted"].includes(call.status)
      ? ACTIVE_CALL_TTL_MS
      : FINISHED_CALL_TTL_MS;
    if (now - call.updatedAt.getTime() > ttl) calls.delete(id);
  }
  if (calls.size <= 200) return;
  const oldest = Array.from(calls.values())
    .sort((left, right) => left.updatedAt.getTime() - right.updatedAt.getTime())
    .slice(0, calls.size - 200);
  oldest.forEach((call) => calls.delete(call.id));
}

function requireParticipant(callId: string, userId: number) {
  cleanCalls();
  const call = calls.get(callId);
  if (!call || (call.fromUserId !== userId && call.toUserId !== userId)) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Call not found" });
  }
  return call;
}

export function createSocialCall(fromUserId: number, toUserId: number, kind: SocialCallKind) {
  cleanCalls();
  if (fromUserId === toUserId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot call your own account" });
  }
  const now = Date.now();
  if (now - (lastCallStartedAt.get(fromUserId) ?? 0) < 5_000) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait before starting another call" });
  }
  const existing = Array.from(calls.values()).find(
    (call) => call.fromUserId === fromUserId && ["ringing", "accepted"].includes(call.status),
  );
  if (existing) {
    throw new TRPCError({ code: "CONFLICT", message: "End your current call before starting another" });
  }
  const createdAt = new Date();
  const call: SocialCallRecord = {
    id: crypto.randomUUID(),
    fromUserId,
    toUserId,
    kind,
    status: "ringing",
    offer: null,
    answer: null,
    candidates: [],
    createdAt,
    updatedAt: createdAt,
  };
  calls.set(call.id, call);
  lastCallStartedAt.set(fromUserId, now);
  return call;
}

export function getIncomingSocialCall(userId: number) {
  cleanCalls();
  return Array.from(calls.values())
    .filter((call) => call.toUserId === userId && call.status === "ringing")
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0] ?? null;
}

export function getSocialCall(callId: string, userId: number) {
  return requireParticipant(callId, userId);
}

export function respondToSocialCall(callId: string, userId: number, accept: boolean) {
  const call = requireParticipant(callId, userId);
  if (call.toUserId !== userId || call.status !== "ringing") {
    throw new TRPCError({ code: "CONFLICT", message: "This call can no longer be answered" });
  }
  call.status = accept ? "accepted" : "declined";
  call.updatedAt = new Date();
  return call;
}

export function signalSocialCall(
  callId: string,
  userId: number,
  signal: {
    type: "offer" | "answer" | "candidate";
    sdp?: string;
    candidate?: string;
    sdpMid?: string | null;
    sdpMLineIndex?: number | null;
  },
) {
  const call = requireParticipant(callId, userId);
  if (["declined", "ended", "missed"].includes(call.status)) {
    throw new TRPCError({ code: "CONFLICT", message: "This call has ended" });
  }
  if (signal.type === "offer") {
    if (call.fromUserId !== userId || !signal.sdp) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid call offer" });
    }
    call.offer = signal.sdp;
  } else if (signal.type === "answer") {
    if (call.toUserId !== userId || !signal.sdp) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid call answer" });
    }
    call.answer = signal.sdp;
  } else if (signal.candidate) {
    call.candidates.push({
      id: crypto.randomUUID(),
      fromUserId: userId,
      candidate: signal.candidate,
      sdpMid: signal.sdpMid ?? null,
      sdpMLineIndex: signal.sdpMLineIndex ?? null,
    });
    call.candidates = call.candidates.slice(-100);
  }
  call.updatedAt = new Date();
  return { success: true };
}

export function endSocialCall(callId: string, userId: number) {
  const call = requireParticipant(callId, userId);
  call.status = call.status === "ringing" && call.fromUserId !== userId ? "declined" : "ended";
  call.updatedAt = new Date();
  return { success: true };
}

export function resetSocialCallsForTests() {
  calls.clear();
  lastCallStartedAt.clear();
}
