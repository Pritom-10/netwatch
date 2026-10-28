import Database from 'better-sqlite3';

const db = new Database('netwatch.db');

db.pragma('journal_mode = WAL');
//creating
db.exec(`
  CREATE TABLE IF NOT EXISTS checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    checked_at TEXT NOT NULL,
    is_up INTEGER NOT NULL,
    latency_ms INTEGER
  );
  CREATE INDEX IF NOT EXISTS idx_checks_time ON checks (checked_at);
`);

export default db;