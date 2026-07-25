import { z } from "zod";

const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value: string): string {
  return value.replace(controlCharacters, "").replace(/\s+/g, " ").trim();
}

export const safeText = (minimum: number, maximum: number) =>
  z.string().transform(cleanText).pipe(z.string().min(minimum).max(maximum));

export const optionalSafeText = (maximum: number) =>
  z.string().transform(cleanText).pipe(z.string().max(maximum)).optional();

export const httpsUrl = z.string().url().refine((value) => {
  const protocol = new URL(value).protocol;
  return protocol === "https:";
}, "A secure HTTPS URL is required");

export const secureUploadUrl = z.string().refine((value) => {
  if (/^\/manus-storage\/[A-Za-z0-9/_.,%+-]+$/.test(value)) return true;
  const parsed = z.string().url().safeParse(value);
  return parsed.success && new URL(value).protocol === "https:";
}, "A secure uploaded file URL is required");

export const profileUpdateSchema = z.object({
  name: safeText(1, 128).optional(),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_]{3,32}$/, "Use 3-32 letters, numbers, or underscores").optional(),
  phone: z.string().trim().regex(/^\+?[0-9 ()-]{7,24}$/, "Enter a valid phone number").optional(),
  avatarUrl: httpsUrl.optional(),
  bio: optionalSafeText(500),
  country: optionalSafeText(64),
  preferredCurrency: z.enum(["USD", "EUR", "GBP", "NGN"]).optional(),
  preferredLanguage: z.enum(["en", "fr", "es", "ar", "pt"]).optional(),
  themePreference: z.enum(["light", "dark", "system"]).optional(),
}).strict();

export const kycSubmissionSchema = z.object({
  documentType: z.enum(["passport", "drivers_license", "national_id"]),
  documentFrontUrl: secureUploadUrl,
  documentBackUrl: secureUploadUrl.optional(),
  selfieUrl: secureUploadUrl,
  proofOfAddressUrl: secureUploadUrl.optional(),
}).strict();

export const metadataSchema = z.record(
  z.string().trim().min(1).max(48),
  z.string().transform(cleanText).pipe(z.string().max(256)),
).refine((value) => Object.keys(value).length <= 20, "Too many metadata fields");

const positiveMoney = z.string().trim().regex(/^\d+(?:\.\d{1,8})?$/).refine((value) => Number(value) > 0);

export const investmentCreationSchema = z.object({
  planId: z.string().trim().regex(/^[a-zA-Z0-9_-]{1,64}$/),
  planName: safeText(1, 128),
  amount: positiveMoney,
  currency: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,16}$/).default("USD"),
  expectedRoi: z.string().trim().regex(/^\d+(?:\.\d{1,8})?$/).refine((value) => Number(value) <= 1000),
  duration: z.number().int().min(1).max(3650),
  agreementId: z.number().int().positive().optional(),
}).strict();
