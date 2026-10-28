'use client';
import { motion } from 'framer-motion';
import CountUp from './CountUp';
import { toBn } from '../lib/format';

export default function SpeedPanel({ summary, series }) {
  const W = 600;
  const H = 140;
  const P = 10;
  const max = Math.max(summary.planMbps, ...series.map((s) => s.mbps), 1);
  const step = series.length > 1 ? (W - P * 2) / (series.length - 1) : 0;
  const y = (v) => H - P - (v / max) * (H - P * 2);
  const path = series
    .map((s, i) => `${i === 0 ? 'M' : 'L'}${(P + i * step).toFixed(1)},${y(s.mbps).toFixed(1)}`)
    .join(' ');
  const planY = y(summary.planMbps);
  const pct = summary.planMbps ? Math.min((summary.avg / summary.planMbps) * 100, 100) : 0;
  const slowPct = summary.tests ? Math.round((summary.slow / summary.tests) * 100) : 0;
  const barColor = pct >= 80 ? '#34d399' : pct >= 60 ? '#fbbf24' : '#fb7185';

  return (
    <div className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-white">ইন্টারনেট স্পিড</h3>
        <span className="text-xs text-slate-400">প্যাকেজ: {toBn(summary.planMbps)} Mbps</span>
      </div>

      {summary.tests === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500">
          এখনো স্পিড টেস্টের ডেটা নেই, প্রতি ঘণ্টায় একবার টেস্ট হয়
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <p className="text-4xl font-bold tracking-tight text-white">
              <CountUp value={summary.avg} decimals={1} suffix=" Mbps" />
            </p>
            <p className="mt-1 text-xs text-slate-400">
              গড় স্পিড, প্যাকেজের {toBn(Math.round(pct))}%
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                style={{ background: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-500">সর্বনিম্ন</p>
                <p className="font-semibold text-white">{toBn(summary.min)} Mbps</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-xs text-slate-500">সর্বোচ্চ</p>
                <p className="font-semibold text-white">{toBn(summary.max)} Mbps</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-rose-300">
              {toBn(summary.slow)}টি টেস্টে ({toBn(slowPct)}%) স্পিড প্যাকেজের ৮০%-এর কম ছিল
            </p>
          </div>

          <div className="lg:col-span-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full">
              <defs>
                <linearGradient id="spd" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0" stopColor="#34d399" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <line
                x1={P}
                x2={W - P}
                y1={planY}
                y2={planY}
                stroke="#94a3b8"
                strokeOpacity="0.5"
                strokeDasharray="6 6"
              />
              <motion.path
                d={path}
                fill="none"
                stroke="url(#spd)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            </svg>
            <p className="mt-1 text-right text-xs text-slate-500">ড্যাশ লাইন = প্যাকেজের স্পিড</p>
          </div>
        </div>
      )}
    </div>
  );
}