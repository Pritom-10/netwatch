import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { startMonitor } from './monitor.js';
import { startSpeedTests } from './speed.js';
import {
  summary,
  outages,
  hourly,
  daily,
  recent,
  speedSummary,
  speedSeries,
  insights,
} from './queries.js';

const app = express();
app.use(cors());

const parseDays = (v) => Math.min(Math.max(parseInt(v) || 7, 1), 90);

app.get('/api/summary', (req, res) => res.json(summary(parseDays(req.query.days))));
app.get('/api/outages', (req, res) => res.json(outages(parseDays(req.query.days))));
app.get('/api/hourly', (req, res) => res.json(hourly(parseDays(req.query.days))));
app.get('/api/daily', (req, res) => res.json(daily(parseDays(req.query.days))));
app.get('/api/recent', (req, res) => res.json(recent()));
app.get('/api/speed-summary', (req, res) => res.json(speedSummary(parseDays(req.query.days))));
app.get('/api/speed-series', (req, res) => res.json(speedSeries(parseDays(req.query.days))));
app.get('/api/insights', (req, res) => res.json(insights(parseDays(req.query.days))));
app.listen(PORT, () => {
  console.log(`NetWatch server: http://localhost:${PORT}`);
});

startMonitor();
startSpeedTests();