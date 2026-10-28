'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDuration, formatTime } from '../lib/format';

function downloadCSV(rows) {
  const head = 'started_at,ended_at,duration_minutes\n';
  const body = rows
    .map((r) => `${r.started_at},${r.ended_at},${(r.durationSec / 60).toFixed(1)}`)
    .join('\n');
  const blob = new Blob(['\uFEFF' + head + body], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'internet-outages.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function OutageList({ rows }) {
  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">ইন্টারনেট বন্ধ থাকার তালিকা</h3>
        <button
          onClick={() => downloadCSV(rows)}
          disabled={!rows.length}
          className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
        >
          CSV ডাউনলোড
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          এই সময়ে কোনো বিচ্ছিন্নতা ধরা পড়েনি
        </p>
      ) : (
        <ul className="divide-y divide-white/5">
          <AnimatePresence initial>
            {rows.slice(0, 12).map((r, i) => (
              <motion.li
                key={r.started_at}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm text-white">{formatTime(r.started_at)}</p>
                  <p className="text-xs text-slate-500">শেষ ব্যর্থ চেক: {formatTime(r.ended_at)}</p>
                </div>
                <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-300">
                  {formatDuration(r.durationSec)}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}