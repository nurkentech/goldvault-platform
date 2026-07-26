import "dotenv/config";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";

const databaseUrl = process.env.DATABASE_URL?.trim();
const jwtSecret = process.env.JWT_SECRET?.trim();

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required in production");
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    "JWT_SECRET must contain at least 32 characters in production"
  );
}

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
const connection = await mysql.createConnection(databaseUrl);

try {
  await migrate(drizzle(connection), { migrationsFolder });
  console.log("[startup] Database migrations are current");
} finally {
  await connection.end();
}

await import("../dist/index.js");
