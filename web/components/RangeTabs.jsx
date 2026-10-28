'use client';
import { motion } from 'framer-motion';

const OPTIONS = [
  { d: 7, label: '৭ দিন' },
  { d: 30, label: '৩০ দিন' },
  { d: 90, label: '৯০ দিন' },
];

export default function RangeTabs({ days, onChange }) {
  return (
    <div className="glass inline-flex gap-1 p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.d}
          onClick={() => onChange(o.d)}
          className="relative rounded-xl px-4 py-2 text-sm font-medium"
        >
          {days === o.d && (
            <motion.span
              layoutId="range-pill"
              className="absolute inset-0 rounded-xl bg-white/10"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            />
          )}
          <span className={`relative ${days === o.d ? 'text-white' : 'text-slate-400'}`}>
            {o.label}
          </span>
        </button>
      ))}
    </div>
  );
}