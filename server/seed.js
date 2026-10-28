import db from './db.js';
import { INTERVAL_SEC } from './config.js';

const insert = db.prepare(
  'INSERT INTO checks (checked_at, is_up, latency_ms) VALUES (?, ?, ?)'
);

const stepMs = INTERVAL_SEC * 1000;
const now = Date.now();
const start = now - 30 * 86400000;

const run = db.transaction(() => {
  let downLeft = 0;
  for (let t = start; t < now; t += stepMs) {
    const hour = new Date(t + 6 * 3600000).getUTCHours();
    const risk = hour >= 20 && hour <= 23 ? 0.012 : 0.002;
    if (downLeft === 0 && Math.random() < risk) {
      downLeft = 2 + Math.floor(Math.random() * 10);
    }
    if (downLeft > 0) {
      downLeft--;
      insert.run(new Date(t).toISOString(), 0, null);
    } else {
      insert.run(new Date(t).toISOString(), 1, 25 + Math.floor(Math.random() * 60));
    }
  }
});

run();
console.log('seed done');