// server/scripts/create_admin.mjs
// Usage (PowerShell example):
// $env:DB_HOST='localhost'; $env:DB_USER='root'; $env:DB_PASS='...'; $env:DB_NAME='questionnaire_db'; $env:ADMIN_EMAIL='admin@example.com'; $env:ADMIN_PWD='admin123';
// node .\scripts\create_admin.mjs

import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

// prefer environment variables, otherwise try to read project config
let DB_HOST = process.env.DB_HOST;
let DB_USER = process.env.DB_USER;
let DB_PASS = process.env.DB_PASS;
let DB_NAME = process.env.DB_NAME;

try {
  const cfg = await import("../config/config.default.js");
  const dbCfg = cfg.default && cfg.default.db ? cfg.default.db : {};
  DB_HOST = DB_HOST || dbCfg.host || dbCfg.hostname || "127.0.0.1";
  DB_USER = DB_USER || dbCfg.username || "root";
  DB_PASS = DB_PASS || dbCfg.password || "";
  DB_NAME = DB_NAME || dbCfg.database || "questionnaire_db";
} catch (e) {
  // ignore if config not available; env vars may still be set
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PWD = process.env.ADMIN_PWD || "admin123";
const ADMIN_NICK = process.env.ADMIN_NICK || "admin";

async function main() {
  const hash = bcrypt.hashSync(ADMIN_PWD, 10);

  const conn = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
  });

  try {
    const sql = `
      INSERT INTO users (email, passwordHash, nickname, role, banned, createdAt, updatedAt)
      VALUES (?, ?, ?, 'admin', 0, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        passwordHash = VALUES(passwordHash),
        nickname = VALUES(nickname),
        role = 'admin',
        banned = 0;
    `;

    const [result] = await conn.execute(sql, [ADMIN_EMAIL, hash, ADMIN_NICK]);

    console.log("OK — admin created/updated:", ADMIN_EMAIL);
    const [rows] = await conn.execute(
      "SELECT id,email,nickname,role,banned,createdAt FROM users WHERE email = ? LIMIT 1",
      [ADMIN_EMAIL]
    );
    console.table(rows);
  } catch (err) {
    if (err && err.code === "ER_ACCESS_DENIED_ERROR") {
      console.error(
        "Access denied: check DB credentials. Provide correct DB password via environment variable DB_PASS or update server/config/config.default.js."
      );
    }
    console.error(
      "Error creating admin:",
      err && err.message ? err.message : err
    );
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
}

main();
