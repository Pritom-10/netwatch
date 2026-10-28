import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import { startMonitor } from './monitor.js';
import { summary, outages, hourly, daily, recent } from './queries.js';

const app = express();
app.use(cors());

const parseDays = (v) => Math.min(Math.max(parseInt(v) || 7, 1), 90);

app.get('/api/summary', (req, res) => res.json(summary(parseDays(req.query.days))));
app.get('/api/outages', (req, res) => res.json(outages(parseDays(req.query.days))));
app.get('/api/hourly', (req, res) => res.json(hourly(parseDays(req.query.days))));
app.get('/api/daily', (req, res) => res.json(daily(parseDays(req.query.days))));
app.get('/api/recent', (req, res) => res.json(recent()));

app.listen(PORT, () => {
  console.log(`NetWatch server: http://localhost:${PORT}`);
});

startMonitor();