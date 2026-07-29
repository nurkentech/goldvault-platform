export type AdminRecoveryCode = {
  code: string;
  used: boolean;
};

export type UserBackupCode = {
  hash: string;
  used: boolean;
};

function parseJsonValue(value: unknown): unknown {
  let parsed = value;

  // Some production MySQL configurations return JSON columns as text, while
  // older rows may contain JSON that was stringified before being persisted.
  // Decode both forms without ever trusting an arbitrary object shape.
  for (let depth = 0; depth < 2 && typeof parsed === "string"; depth++) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  return parsed;
}

export function normalizeAdminRecoveryCodes(
  value: unknown,
): AdminRecoveryCode[] {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as { code?: unknown }).code !== "string"
    ) {
      return [];
    }

    const code = (entry as { code: string }).code.trim();
    if (!/^[a-f0-9]{64}$/i.test(code)) return [];

    return [{
      code,
      used: (entry as { used?: unknown }).used === true,
    }];
  });
}

export function normalizeUserBackupCodes(value: unknown): UserBackupCode[] {
  const parsed = parseJsonValue(value);
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== "object" ||
      typeof (entry as { hash?: unknown }).hash !== "string"
    ) {
      return [];
    }

    const hash = (entry as { hash: string }).hash.trim();
    if (!/^[a-f0-9]{64}$/i.test(hash)) return [];

    return [{
      hash,
      used: (entry as { used?: unknown }).used === true,
    }];
  });
}
