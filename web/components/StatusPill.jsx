'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../lib/format';

export default function StatusPill({ last }) {
  const up = last ? last.is_up === 1 : null;
  const color = up === null ? 'text-slate-400' : up ? 'text-emerald-400' : 'text-rose-400';
  const label = up === null ? 'ডেটা নেই' : up ? 'ইন্টারনেট চালু' : 'ইন্টারনেট বন্ধ';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="glass flex items-center gap-3 px-4 py-2.5"
      >
        <span className={`ring-ping block h-2.5 w-2.5 rounded-full bg-current ${color}`} />
        <div className="leading-tight">
          <p className={`text-sm font-semibold ${color}`}>{label}</p>
          {last && (
            <p className="text-xs text-slate-400">শেষ চেক: {formatTime(last.checked_at)}</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}