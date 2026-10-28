import db from './db.js';
import { INTERVAL_SEC, TARGETS } from './config.js';

const insert = db.prepare(
  'INSERT INTO checks (checked_at, is_up, latency_ms) VALUES (?, ?, ?)'
);

async function ping(url) {
  const start = performance.now();
  const res = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) throw new Error('bad status');
  return Math.round(performance.now() - start);
}

async function runCheck() {
  let latency = null;
  for (const url of TARGETS) {
    try {
      latency = await ping(url);
      break;
    } catch {}
  }
  insert.run(new Date().toISOString(), latency === null ? 0 : 1, latency);
}

export function startMonitor() {
  runCheck();
  setInterval(runCheck, INTERVAL_SEC * 1000);
}