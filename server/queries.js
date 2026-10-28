import db from './db.js';
import { INTERVAL_SEC, TZ_MODIFIER, PLAN_MBPS } from './config.js';

const sinceISO = (days) => new Date(Date.now() - days * 86400000).toISOString();

function outageRows(since) {
  const rows = db
    .prepare(
      `
      WITH marked AS (
        SELECT
          checked_at,
          is_up,
          ROW_NUMBER() OVER (ORDER BY id)
            - ROW_NUMBER() OVER (PARTITION BY is_up ORDER BY id) AS grp
        FROM checks
        WHERE checked_at >= ?
      )
      SELECT
        MIN(checked_at) AS started_at,
        MAX(checked_at) AS ended_at,
        COUNT(*) AS fails
      FROM marked
      WHERE is_up = 0
      GROUP BY grp
      ORDER BY started_at DESC
    `
    )
    .all(since);
  return rows.map((r) => ({ ...r, durationSec: r.fails * INTERVAL_SEC }));
}

export function summary(days) {
  const since = sinceISO(days);
  const row = db
    .prepare(
      `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN is_up = 0 THEN 1 ELSE 0 END) AS down,
        ROUND(AVG(latency_ms)) AS avg_latency
      FROM checks
      WHERE checked_at >= ?
    `
    )
    .get(since);
  const last = db
    .prepare('SELECT checked_at, is_up, latency_ms FROM checks ORDER BY id DESC LIMIT 1')
    .get();
  const total = row.total;
  const down = row.down ?? 0;
  const list = outageRows(since);
  return {
    total,
    down,
    uptime: total ? Number((((total - down) / total) * 100).toFixed(2)) : 100,
    avgLatency: row.avg_latency ?? 0,
    outageCount: list.length,
    downtimeSec: down * INTERVAL_SEC,
    last: last ?? null,
    intervalSec: INTERVAL_SEC,
  };
}

export function outages(days) {
  return outageRows(sinceISO(days));
}

export function daily(days) {
  return db
    .prepare(
      `
      SELECT
        date(checked_at, ?) AS day,
        COUNT(*) AS total,
        SUM(CASE WHEN is_up = 0 THEN 1 ELSE 0 END) AS down
      FROM checks
      WHERE checked_at >= ?
      GROUP BY day
      ORDER BY day
    `
    )
    .all(TZ_MODIFIER, sinceISO(days));
}

export function hourly(days) {
  return db
    .prepare(
      `
      SELECT
        CAST(strftime('%H', checked_at, ?) AS INTEGER) AS hour,
        COUNT(*) AS total,
        SUM(CASE WHEN is_up = 0 THEN 1 ELSE 0 END) AS down
      FROM checks
      WHERE checked_at >= ?
      GROUP BY hour
      ORDER BY hour
    `
    )
    .all(TZ_MODIFIER, sinceISO(days));
}

export function recent() {
  return db
    .prepare('SELECT checked_at, is_up, latency_ms FROM checks ORDER BY id DESC LIMIT 60')
    .all()
    .reverse();
}
export function lastCheck() {
  return db.prepare('SELECT is_up FROM checks ORDER BY id DESC LIMIT 1').get();
}

export function currentDownStreak() {
  return db
    .prepare(
      `
      SELECT
        COUNT(*) AS fails,
        MIN(checked_at) AS started_at
      FROM checks
      WHERE id > COALESCE(
        (SELECT MAX(id) FROM checks WHERE is_up = 1),
        0
      )
    `
    )
    .get();
}

export function speedSummary(days) {
  const row = db
    .prepare(
      `
      SELECT
        COUNT(*) AS tests,
        ROUND(AVG(mbps), 2) AS avg_mbps,
        MIN(mbps) AS min_mbps,
        MAX(mbps) AS max_mbps,
        SUM(CASE WHEN mbps < ? THEN 1 ELSE 0 END) AS slow
      FROM speed_tests
      WHERE tested_at >= ?
    `
    )
    .get(PLAN_MBPS * 0.8, sinceISO(days));
  return {
    planMbps: PLAN_MBPS,
    tests: row.tests,
    avg: row.avg_mbps ?? 0,
    min: row.min_mbps ?? 0,
    max: row.max_mbps ?? 0,
    slow: row.slow ?? 0,
  };
}

export function speedSeries(days) {
  return db
    .prepare('SELECT tested_at, mbps FROM speed_tests WHERE tested_at >= ? ORDER BY tested_at')
    .all(sinceISO(days));
}
export function insights(days) {
  const since = sinceISO(days);

  const worstDay = db
    .prepare(
      `
      SELECT
        date(checked_at, ?) AS day,
        SUM(CASE WHEN is_up = 0 THEN 1 ELSE 0 END) AS down,
        COUNT(*) AS total
      FROM checks
      WHERE checked_at >= ?
      GROUP BY day
      HAVING down > 0
      ORDER BY down DESC
      LIMIT 1
    `
    )
    .get(TZ_MODIFIER, since);

  const longest = outageRows(since).sort((a, b) => b.fails - a.fails)[0] ?? null;

  const speedByHour = db
    .prepare(
      `
      SELECT
        CAST(strftime('%H', tested_at, ?) AS INTEGER) AS hour,
        ROUND(AVG(mbps), 2) AS avg_mbps,
        COUNT(*) AS tests
      FROM speed_tests
      WHERE tested_at >= ?
      GROUP BY hour
      ORDER BY avg_mbps ASC
    `
    )
    .all(TZ_MODIFIER, since);

  const dayRows = db
    .prepare(
      `
      WITH d AS (
        SELECT
          date(checked_at, ?) AS day,
          COUNT(*) AS total,
          SUM(CASE WHEN is_up = 0 THEN 1 ELSE 0 END) AS down
        FROM checks
        WHERE checked_at >= ?
        GROUP BY day
      ),
      s AS (
        SELECT
          date(tested_at, ?) AS day,
          ROUND(AVG(mbps), 2) AS avg_mbps
        FROM speed_tests
        WHERE tested_at >= ?
        GROUP BY day
      )
      SELECT
        d.day,
        d.total,
        d.down,
        s.avg_mbps,
        d.down - LAG(d.down) OVER (ORDER BY d.day) AS down_change
      FROM d
      LEFT JOIN s ON s.day = d.day
      ORDER BY d.day DESC
      LIMIT 7
    `
    )
    .all(TZ_MODIFIER, since, TZ_MODIFIER, since);

  return {
    worstDay: worstDay ? { ...worstDay, downSec: worstDay.down * INTERVAL_SEC } : null,
    longest,
    slowestHour: speedByHour[0] ?? null,
    fastestHour: speedByHour[speedByHour.length - 1] ?? null,
    dayTable: dayRows.map((r) => ({
      ...r,
      downSec: r.down * INTERVAL_SEC,
      changeSec: r.down_change === null ? null : r.down_change * INTERVAL_SEC,
    })),
  };
}