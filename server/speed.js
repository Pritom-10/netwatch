import db from './db.js';
import { SPEED_BYTES, SPEED_EVERY_MIN } from './config.js';

const insert = db.prepare(
  'INSERT INTO speed_tests (tested_at, mbps, bytes) VALUES (?, ?, ?)'
);

async function measure() {
  const start = performance.now();
  const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${SPEED_BYTES}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error('bad status');
  const buf = await res.arrayBuffer();
  const sec = (performance.now() - start) / 1000;
  return { mbps: (buf.byteLength * 8) / sec / 1e6, bytes: buf.byteLength };
}

async function runSpeedTest() {
  try {
    const { mbps, bytes } = await measure();
    insert.run(new Date().toISOString(), Number(mbps.toFixed(2)), bytes);
  } catch (err) {
    console.log('Speed test এরর:', err.message);
  }
}

export function startSpeedTests() {
  runSpeedTest();
  setInterval(runSpeedTest, SPEED_EVERY_MIN * 60 * 1000);
}