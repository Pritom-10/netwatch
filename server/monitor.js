import db from './db.js';
import { INTERVAL_SEC, TARGETS } from './config.js';
import { currentDownStreak, lastCheck } from './queries.js';
import { sendTelegram } from './notify.js';

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

  const isUp = latency !== null;
  const prev = lastCheck();
  let streak = null;

  if (isUp && prev && prev.is_up === 0) {
    streak = currentDownStreak();
  }

  insert.run(new Date().toISOString(), isUp ? 1 : 0, latency);

  if (streak && streak.fails >= 2) {
    const minutes = Math.max(1, Math.round((streak.fails * INTERVAL_SEC) / 60));
    await sendTelegram(
      `ইন্টারনেট ফিরে এসেছে। প্রায় ${minutes.toLocaleString('bn-BD')} মিনিট বন্ধ ছিল।`
    );
  }
}

export function startMonitor() {
  runCheck();
  setInterval(runCheck, INTERVAL_SEC * 1000);
}