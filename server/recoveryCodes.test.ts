import { describe, expect, it } from "vitest";
import {
  normalizeAdminRecoveryCodes,
  normalizeUserBackupCodes,
} from "./recoveryCodes";

describe("recovery-code JSON normalization", () => {
  const adminCodes = [
    { code: "c".repeat(64), used: false },
    { code: "d".repeat(64), used: true },
  ];
  const userCodes = [
    { hash: "a".repeat(64), used: false },
    { hash: "b".repeat(64), used: true },
  ];

  it("accepts native arrays from JSON-aware database drivers", () => {
    expect(normalizeAdminRecoveryCodes(adminCodes)).toEqual(adminCodes);
    expect(normalizeUserBackupCodes(userCodes)).toEqual(userCodes);
  });

  it("decodes text and legacy double-encoded JSON columns", () => {
    expect(normalizeAdminRecoveryCodes(JSON.stringify(adminCodes))).toEqual(
      adminCodes,
    );
    expect(
      normalizeAdminRecoveryCodes(JSON.stringify(JSON.stringify(adminCodes))),
    ).toEqual(adminCodes);
    expect(normalizeUserBackupCodes(JSON.stringify(userCodes))).toEqual(
      userCodes,
    );
  });

  it("returns a safe empty list for malformed values and entries", () => {
    expect(normalizeAdminRecoveryCodes("not-json")).toEqual([]);
    expect(normalizeAdminRecoveryCodes({ code: "c".repeat(64) })).toEqual([]);
    expect(normalizeAdminRecoveryCodes([{ used: false }, null])).toEqual([]);
    expect(normalizeUserBackupCodes([{ hash: "too-short", used: false }])).toEqual(
      [],
    );
  });
});
