'use client';
import { motion } from 'framer-motion';
import { formatDuration, formatTime, toBn } from '../lib/format';

function Tile({ title, value, sub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl bg-white/5 p-4"
    >
      <p className="text-xs text-slate-400">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

function Change({ sec }) {
  if (sec === null || sec === 0) return <span className="text-slate-500">—</span>;
  const worse = sec > 0;
  return (
    <span className={worse ? 'text-rose-300' : 'text-emerald-300'}>
      {worse ? '▲' : '▼'} {formatDuration(Math.abs(sec))}
    </span>
  );
}

export default function Insights({ data }) {
  const { worstDay, longest, slowestHour, dayTable } = data;

  return (
    <div className="glass p-5">
      <h3 className="mb-4 font-semibold text-white">ইনসাইট</h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <Tile
          index={0}
          title="সবচেয়ে খারাপ দিন"
          value={worstDay ? worstDay.day : 'কোনো সমস্যা নেই'}
          sub={worstDay ? `${formatDuration(worstDay.downSec)} বন্ধ ছিল` : null}
        />
        <Tile
          index={1}
          title="সবচেয়ে লম্বা বিচ্ছিন্নতা"
          value={longest ? formatDuration(longest.durationSec) : 'কোনোটা নেই'}
          sub={longest ? formatTime(longest.started_at) : null}
        />
        <Tile
          index={2}
          title="সবচেয়ে ধীর সময়"
          value={slowestHour ? `${toBn(slowestHour.hour)}টার দিকে` : 'ডেটা নেই'}
          sub={slowestHour ? `গড় ${toBn(slowestHour.avg_mbps)} Mbps` : null}
        />
      </div>

      {dayTable.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-slate-500">
                <th className="pb-2 font-medium">তারিখ</th>
                <th className="pb-2 font-medium">বন্ধ ছিল</th>
                <th className="pb-2 font-medium">গড় স্পিড</th>
                <th className="pb-2 font-medium">আগের দিনের তুলনায়</th>
              </tr>
            </thead>
            <tbody>
              {dayTable.map((r, i) => (
                <motion.tr
                  key={r.day}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-t border-white/5"
                >
                  <td className="py-2.5 text-white">{r.day}</td>
                  <td className="py-2.5 text-slate-300">{formatDuration(r.downSec)}</td>
                  <td className="py-2.5 text-slate-300">
                    {r.avg_mbps === null ? '—' : `${toBn(r.avg_mbps)} Mbps`}
                  </td>
                  <td className="py-2.5">
                    <Change sec={r.changeSec} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}