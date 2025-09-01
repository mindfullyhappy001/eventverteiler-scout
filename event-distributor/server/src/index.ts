import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { router as eventsRouter } from './routes/events.js';
import { router as csvRouter } from './routes/csv.js';
import { router as platformsRouter } from './routes/platforms.js';
import { router as publishRouter } from './routes/publish.js';
import { router as logsRouter } from './routes/logs.js';
import { initScheduler } from './scheduler/scheduler.js';
import { ensurePlatformConfigs } from './init/platforms.js';

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(pinoHttp({ logger }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/events', eventsRouter);
app.use('/api/csv', csvRouter);
app.use('/api/platforms', platformsRouter);
app.use('/api/publish', publishRouter);
app.use('/api/logs', logsRouter);

const port = Number(process.env.PORT || 8080);

ensurePlatformConfigs().catch((e) => logger.error({ e }, 'ensurePlatformConfigs failed'));

initScheduler(logger).catch((e) => {
  logger.error({ e }, 'Scheduler init failed');
});

app.listen(port, () => {
  logger.info({ port }, 'Server listening');
});
