'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getJSON } from '../lib/api';
import { formatDuration, toBn } from '../lib/format';
import CountUp from '../components/CountUp';
import StatusPill from '../components/StatusPill';
import RangeTabs from '../components/RangeTabs';
import StatCard from '../components/StatCard';
import DayStrip from '../components/DayStrip';
import Sparkline from '../components/Sparkline';
import HourChart from '../components/HourChart';
import OutageList from '../components/OutageList';
import SpeedPanel from '../components/SpeedPanel';
import Insights from '../components/Insights';

export default function Home() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [summary, outages, hourly, daily, recent, speed, speedSeries, insights] =
          await Promise.all([
            getJSON(`/api/summary?days=${days}`),
            getJSON(`/api/outages?days=${days}`),
            getJSON(`/api/hourly?days=${days}`),
            getJSON(`/api/daily?days=${days}`),
            getJSON('/api/recent'),
            getJSON(`/api/speed-summary?days=${days}`),
            getJSON(`/api/speed-series?days=${days}`),
            getJSON(`/api/insights?days=${days}`),
          ]);
        if (alive) {
          setData({ summary, outages, hourly, daily, recent, speed, speedSeries, insights });
          setError(false);
        }
      } catch {
        if (alive) setError(true);
      }
    }
    load();
    const id = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [days]);

  const dayList = useMemo(() => {
    if (!data) return [];
    const map = new Map(data.daily.map((d) => [d.day, d]));
    return Array.from({ length: days }, (_, i) => {
      // eslint-disable-next-line react-hooks/purity
      const dt = new Date(Date.now() - (days - 1 - i) * 86400000);
      const key = dt.toLocaleDateString('en-CA');
      return map.get(key) ?? { day: key, total: 0, down: 0 };
    });
  }, [data, days]);

  const s = data?.summary;

  return (
    <>
      <div className="blob a" />
      <div className="blob b" />
      <div className="blob c" />

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              নেট
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg,#22d3ee,#818cf8)' }}
              >
                ওয়াচ
              </span>
            </h1>
            <p className="mt-1 text-sm text-slate-400">আপনার ইন্টারনেটের আসল অবস্থার প্রমাণ</p>
          </motion.div>
          <StatusPill last={s?.last ?? null} />
        </header>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <RangeTabs days={days} onChange={setDays} />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-rose-300"
            >
              সার্ভারের সাথে যোগাযোগ হচ্ছে না, server চালু আছে কি না দেখো
            </motion.p>
          )}
        </div>

        {!data ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                index={0}
                title="আপটাইম"
                accent="#34d399"
                hint={`${toBn(s.total)}টি চেকের মধ্যে`}
              >
                <CountUp value={s.uptime} decimals={2} suffix="%" />
              </StatCard>
              <StatCard
                index={1}
                title="মোট বন্ধ ছিল"
                accent="#fb7185"
                hint={`${toBn(s.down)}টি ব্যর্থ চেক`}
              >
                {formatDuration(s.downtimeSec)}
              </StatCard>
              <StatCard index={2} title="বিচ্ছিন্ন হয়েছে" accent="#fbbf24">
                <CountUp value={s.outageCount} suffix=" বার" />
              </StatCard>
              <StatCard index={3} title="গড় লেটেন্সি" accent="#22d3ee">
                <CountUp value={s.avgLatency} suffix=" ms" />
              </StatCard>
            </div>

            <div className="mt-4">
              <DayStrip key={days} days={dayList} />
            </div>

            <div className="mt-4">
              <SpeedPanel key={days} summary={data.speed} series={data.speedSeries} />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <Sparkline data={data.recent} />
              <HourChart key={days} data={data.hourly} />
            </div>

            <div className="mt-4">
              <Insights data={data.insights} />
            </div>

            <div className="mt-4">
              <OutageList rows={data.outages} />
            </div>
          </>
        )}
      </main>
    </>
  );
}