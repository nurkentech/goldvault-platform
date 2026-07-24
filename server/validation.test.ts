import { describe, expect, it } from "vitest";
import { cleanText, httpsUrl, investmentCreationSchema, kycSubmissionSchema, metadataSchema, profileUpdateSchema, secureUploadUrl } from "./validation";

describe("request validation", () => {
  it("normalizes whitespace and removes control characters", () => {
    expect(cleanText("  Gold\u0000   Vaults  ")).toBe("Gold Vaults");
  });

  it("normalizes safe profile fields", () => {
    expect(profileUpdateSchema.parse({ name: "  Ada   Lovelace ", username: " ADA_1 " })).toMatchObject({
      name: "Ada Lovelace", username: "ada_1",
    });
  });

  it("rejects unsafe usernames", () => {
    expect(() => profileUpdateSchema.parse({ username: "<script>" })).toThrow();
  });

  it("requires HTTPS document URLs", () => {
    expect(() => httpsUrl.parse("http://files.example.test/id.png")).toThrow();
    expect(httpsUrl.parse("https://files.example.test/id.png")).toContain("https://");
  });

  it("accepts only the protected same-origin upload path", () => {
    expect(secureUploadUrl.parse("/manus-storage/user/id-front.png")).toContain("/manus-storage/");
    expect(() => secureUploadUrl.parse("/uploads/id-front.png")).toThrow();
  });

  it("requires KYC front and selfie files", () => {
    expect(() => kycSubmissionSchema.parse({ documentType: "passport", documentFrontUrl: "https://x.test/a" })).toThrow();
  });

  it("limits metadata keys and values", () => {
    const tooMany = Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`key${index}`, "value"]));
    expect(() => metadataSchema.parse(tooMany)).toThrow();
    expect(metadataSchema.parse({ bank: " Gold   Bank " })).toEqual({ bank: "Gold Bank" });
  });

  it("validates and normalizes investment creation inputs", () => {
    expect(investmentCreationSchema.parse({
      planId: "gold-90", planName: "  Gold   Growth ", amount: "100.50",
      currency: "xau", expectedRoi: "12.5", duration: 90,
    })).toMatchObject({ planName: "Gold Growth", currency: "XAU", amount: "100.50" });
    expect(() => investmentCreationSchema.parse({
      planId: "gold", planName: "Gold", amount: "-1", currency: "USD", expectedRoi: "10", duration: 30,
    })).toThrow();
  });
});
