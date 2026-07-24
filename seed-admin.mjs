import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const {
  DATABASE_URL,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
  ADMIN_EMAIL,
} = process.env;

if (!DATABASE_URL || !ADMIN_USERNAME || !ADMIN_PASSWORD || !ADMIN_EMAIL) {
  console.error(
    "DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD, and ADMIN_EMAIL are required",
  );
  process.exit(1);
}

async function main() {
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const connection = await mysql.createConnection(DATABASE_URL);

  // Upsert admin credentials
  await connection.execute(
    `INSERT INTO admin_credentials (username, passwordHash, email)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), email = VALUES(email)`,
    [ADMIN_USERNAME, passwordHash, ADMIN_EMAIL]
  );

  console.log("Admin credentials seeded successfully!");
  console.log(`Username: ${ADMIN_USERNAME}`);
  console.log(`Email: ${ADMIN_EMAIL}`);

  await connection.end();
}

main().catch(console.error);
