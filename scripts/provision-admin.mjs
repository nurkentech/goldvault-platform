import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export function validateCredentials(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Admin credentials must be a JSON object");
  }

  const username = typeof input.username === "string" ? input.username.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!/^[A-Za-z0-9_.-]{3,64}$/.test(username)) {
    throw new Error("Admin username must be 3-64 letters, numbers, dots, dashes, or underscores");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    throw new Error("Admin email is invalid");
  }
  if (password.length < 10 || password.length > 128) {
    throw new Error("Admin password must be 10-128 characters");
  }

  return { username, email, password };
}

async function provisionAdmin() {
  const credentialsPath = process.argv[2];
  const appCurrent = process.env.APP_CURRENT?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!credentialsPath) throw new Error("Credentials file path is required");
  if (!appCurrent) throw new Error("APP_CURRENT is required");
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const credentials = validateCredentials(
    JSON.parse(await fs.readFile(credentialsPath, "utf8"))
  );
  const requireFromApp = createRequire(path.join(appCurrent, "package.json"));
  const bcrypt = requireFromApp("bcryptjs");
  const mysql = requireFromApp("mysql2/promise");
  const connection = await mysql.createConnection(databaseUrl);

  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id, username, email, passwordHash FROM admin_credentials WHERE username = ? OR email = ? LIMIT 2 FOR UPDATE",
      [credentials.username, credentials.email]
    );

    if (rows.length > 0) {
      const exact = rows.find(
        row => row.username === credentials.username && row.email.toLowerCase() === credentials.email
      );
      if (!exact) {
        throw new Error("Admin username or email is already assigned to a different account");
      }

      const passwordMatches = await bcrypt.compare(credentials.password, exact.passwordHash);
      if (!passwordMatches) {
        throw new Error("Admin account already exists with a different password; refusing to overwrite it");
      }

      await connection.commit();
      console.log(JSON.stringify({
        status: "already-configured",
        username: credentials.username,
        email: credentials.email,
      }));
      return;
    }

    const passwordHash = await bcrypt.hash(credentials.password, 12);
    await connection.execute(
      "INSERT INTO admin_credentials (username, passwordHash, email) VALUES (?, ?, ?)",
      [credentials.username, passwordHash, credentials.email]
    );
    await connection.commit();
    console.log(JSON.stringify({
      status: "created",
      username: credentials.username,
      email: credentials.email,
    }));
  } catch (error) {
    await connection.rollback().catch(() => undefined);
    throw error;
  } finally {
    await connection.end();
  }
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  provisionAdmin().catch(error => {
    console.error(error instanceof Error ? error.message : "Admin provisioning failed");
    process.exitCode = 1;
  });
}
