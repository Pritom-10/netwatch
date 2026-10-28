import db from './db.js';
import { PLAN_MBPS } from './config.js';

const insert = db.prepare(
  'INSERT INTO speed_tests (tested_at, mbps, bytes) VALUES (?, ?, ?)'
);

const now = Date.now();
const start = now - 30 * 86400000;

const run = db.transaction(() => {
  for (let t = start; t < now; t += 3600000) {
    const hour = new Date(t + 6 * 3600000).getUTCHours();
    const evening = hour >= 19 && hour <= 23;
    const base = evening ? PLAN_MBPS * 0.55 : PLAN_MBPS * 0.92;
    const mbps = Math.max(0.5, base + (Math.random() - 0.5) * PLAN_MBPS * 0.3);
    insert.run(new Date(t).toISOString(), Number(mbps.toFixed(2)), 3000000);
  }
});

run();
console.log('speed seed done');