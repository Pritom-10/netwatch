import db from './db.js';
import { INTERVAL_SEC, TZ_MODIFIER } from './config.js';

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