'use client';
import { motion } from 'framer-motion';

export default function StatCard({ title, children, hint, accent = '#6366f1', index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 120, damping: 18 }}
      whileHover={{ y: -4 }}
      className="glass relative overflow-hidden p-5"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-25 blur-2xl"
        style={{ background: accent }}
      />
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">{children}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </motion.div>
  );
}