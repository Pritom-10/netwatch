'use client';
import { motion } from 'framer-motion';
import { toBn } from '../lib/format';

export default function HourChart({ data }) {
  const byHour = Array.from({ length: 24 }, (_, h) => {
    const row = data.find((r) => r.hour === h);
    const total = row?.total ?? 0;
    const down = row?.down ?? 0;
    return { hour: h, total, pct: total ? (down / total) * 100 : 0 };
  });
  const max = Math.max(1, ...byHour.map((b) => b.pct));
  const worst = byHour.reduce((a, b) => (b.pct > a.pct ? b : a), byHour[0]);

  return (
    <div className="glass p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">কোন সময়ে সমস্যা বেশি</h3>
        {worst.pct > 0 && (
          <span className="text-xs text-rose-300">
            সবচেয়ে খারাপ: {toBn(worst.hour)}টার দিকে
          </span>
        )}
      </div>
      <div className="flex h-32 items-end gap-1.5">
        {byHour.map((b, i) => (
          <motion.div
            key={b.hour}
            title={`${toBn(b.hour)}টা: ${toBn(b.pct.toFixed(1))}% ব্যর্থ`}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((b.pct / max) * 100, b.total ? 4 : 1)}%` }}
            transition={{ delay: i * 0.02, type: 'spring', stiffness: 90, damping: 16 }}
            className={`flex-1 rounded-t-md ${b.pct > 0 ? 'bg-rose-400/80' : 'bg-white/10'}`}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-1.5">
        {byHour.map((b) => (
          <span key={b.hour} className="flex-1 text-center text-[10px] text-slate-500">
            {b.hour % 3 === 0 ? toBn(b.hour) : ''}
          </span>
        ))}
      </div>
    </div>
  );
}