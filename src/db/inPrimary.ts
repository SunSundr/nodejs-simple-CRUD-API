import cluster from 'node:cluster';
import { DataStorage } from './dataStorage';
import { UserDb, DbMessage } from '../types';
import { ResponseError } from '../utils/errors';
import { err, LogPrefix } from '../utils/logger';
import { MESSAGES } from '../config';

export function startDb(): DataStorage | null {
  const { workers } = cluster;
  if (workers) {
    const storage = new DataStorage();
    for (const worker of Object.values(workers)) {
      if (worker) {
        worker.on('message', async (msg: DbMessage) => {
          const { action } = msg;
          if (typeof storage[action] === 'function') {
            const params = msg.data ?? [];
            const result = storage[action](...(params as [string & UserDb, UserDb & number]));
            if (result instanceof ResponseError) {
              worker.send({ ...msg, data: undefined, error: result.serialize() });
            } else {
              const data = typeof result === 'object' ? result : undefined;
              worker.send({ ...msg, data });
            }
          } else {
            worker.send({
              ...msg,
              code: 500,
              error: ResponseError.new(MESSAGES.unknownAction, 500).serialize(),
            });
            err(LogPrefix.error, `${MESSAGES.unknownAction}: ${action}`);
          }
        });
      }
    }

    return storage;
  }

  return null;
}
