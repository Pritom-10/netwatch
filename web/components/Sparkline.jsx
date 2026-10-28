'use client';
import { motion } from 'framer-motion';

export default function Sparkline({ data }) {
  const W = 600;
  const H = 120;
  const P = 8;
  const values = data.filter((d) => d.is_up === 1).map((d) => d.latency_ms);
  const max = Math.max(100, ...values);
  const step = data.length > 1 ? (W - P * 2) / (data.length - 1) : 0;
  const y = (v) => H - P - (v / max) * (H - P * 2);

  let path = '';
  let pen = false;
  data.forEach((d, i) => {
    if (d.is_up !== 1) {
      pen = false;
      return;
    }
    const x = P + i * step;
    path += `${pen ? 'L' : 'M'}${x.toFixed(1)},${y(d.latency_ms).toFixed(1)} `;
    pen = true;
  });

  return (
    <div className="glass p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-white">সাম্প্রতিক লেটেন্সি</h3>
        <span className="text-xs text-slate-400">শেষ {data.length}টি চেক</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full">
        <defs>
          <linearGradient id="lat" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {data.map((d, i) =>
          d.is_up === 1 ? null : (
            <line
              key={d.checked_at}
              x1={P + i * step}
              x2={P + i * step}
              y1={P}
              y2={H - P}
              stroke="#f43f5e"
              strokeOpacity="0.5"
              strokeWidth="2"
            />
          )
        )}
        <motion.path
          d={path}
          fill="none"
          stroke="url(#lat)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}