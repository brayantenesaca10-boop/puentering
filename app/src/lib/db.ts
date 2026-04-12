import { createClient } from '@libsql/client';

// For MVP, use local SQLite file. Switch to Turso URL later.
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:local.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      hometown TEXT,
      photo_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS voice_answers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_index INTEGER NOT NULL,
      audio_data TEXT NOT NULL,
      transcript TEXT,
      photo_data TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      profile_user_id TEXT NOT NULL,
      visitor_name TEXT NOT NULL,
      visitor_email TEXT,
      visitor_phone TEXT,
      matches TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (profile_user_id) REFERENCES users(id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS rings (
      code TEXT PRIMARY KEY,
      user_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

export default db;
