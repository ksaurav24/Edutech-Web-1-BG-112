import { Request, Response } from 'express';
import os from 'os';
import { Connection, ConnectionStates } from 'mongoose';
import { ApiResponse } from '../utils/ApiResponse';
import { env } from '../config/env';

const STATE_LABEL: Record<number, string> = {
  [ConnectionStates.disconnected]: 'disconnected',
  [ConnectionStates.connected]: 'connected',
  [ConnectionStates.connecting]: 'connecting',
  [ConnectionStates.disconnecting]: 'disconnecting',
  [ConnectionStates.uninitialized]: 'uninitialized',
};

function systemSnapshot() {
  const mem = process.memoryUsage();
  return {
    uptimeSec: Math.round(process.uptime()),
    environment: env.nodeEnv,
    pid: process.pid,
    nodeVersion: process.version,
    host: {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      loadavg: os.loadavg(),
      totalMemMb: Math.round(os.totalmem() / 1024 / 1024),
      freeMemMb: Math.round(os.freemem() / 1024 / 1024),
    },
    memory: {
      rssMb: +(mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMb: +(mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMb: +(mem.heapTotal / 1024 / 1024).toFixed(2),
      externalMb: +(mem.external / 1024 / 1024).toFixed(2),
    },
  };
}

async function dbSnapshot(db?: Connection) {
  if (!db) return { kind: 'mongodb', status: 'not_configured' };
  const state = db.readyState;
  const base = {
    kind: 'mongodb',
    status: STATE_LABEL[state] ?? 'unknown',
    host: db.host,
    name: db.name,
  };
  if (state !== ConnectionStates.connected) return base;
  try {
    const start = Date.now();
    await db.db?.admin().ping();
    return { ...base, pingMs: Date.now() - start };
  } catch (err) {
    return { ...base, status: 'unreachable', error: (err as Error).message };
  }
}

export function createHealthController(db?: Connection) {
  return {
    liveness: (_req: Request, res: Response) => {
      return ApiResponse.ok(res, { status: 'alive', ...systemSnapshot() }, 'Service is alive');
    },
    readiness: async (_req: Request, res: Response) => {
      const database = await dbSnapshot(db);
      const ready = !db || database.status === 'connected';
      const payload = { status: ready ? 'ready' : 'degraded', ...systemSnapshot(), database };
      return new ApiResponse(ready ? 200 : 503, payload.status, payload).send(res);
    },
  };
}

