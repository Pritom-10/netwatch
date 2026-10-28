'use client';
import { motion } from 'framer-motion';
import { toBn } from '../lib/format';

function colorFor(d) {
  if (!d.total) return 'bg-white/10';
  const pct = (d.down / d.total) * 100;
  if (pct === 0) return 'bg-emerald-400';
  if (pct < 5) return 'bg-amber-400';
  return 'bg-rose-500';
}

export default function DayStrip({ days }) {
  return (
    <div className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-white">দিনভিত্তিক আপটাইম</h3>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            ভালো
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            সামান্য সমস্যা
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
            বেশি সমস্যা
          </span>
        </div>
      </div>
      <div className="flex h-14 items-end gap-1">
        {days.map((d, i) => {
          const up = d.total ? (((d.total - d.down) / d.total) * 100).toFixed(1) : null;
          return (
            <motion.div
              key={d.day}
              title={up ? `${d.day}: ${toBn(up)}% আপ` : `${d.day}: ডেটা নেই`}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              transition={{ delay: i * 0.015, duration: 0.4 }}
              style={{ originY: 1 }}
              className={`h-full flex-1 rounded-sm ${colorFor(d)} hover:brightness-125`}
            />
          );
        })}
      </div>
    </div>
  );
}