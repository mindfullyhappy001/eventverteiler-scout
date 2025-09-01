import pino from 'pino';
import { prisma } from '../db/client.js';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export async function logDb(scope: string, level: 'info'|'warn'|'error', message: string, meta?: any) {
  try {
    await prisma.logEntry.create({ data: { scope, level, message, meta } });
  } catch (e) {
    logger.warn({ e }, 'Failed to write log to DB');
  }
}
