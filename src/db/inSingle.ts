import { DataStorage } from './dataStorage';
import { UserDb, DbMessage } from '../types';
import { ResponseError } from '../utils/errors';
import { MESSAGES } from '../config';

export function callDb(msg: DbMessage, storage: DataStorage): DbMessage {
  const { action } = msg;
  if (typeof storage[action] === 'function') {
    const params = msg.data ?? [];
    const result = storage[action](...(params as [string & UserDb, UserDb & number]));
    if (result instanceof ResponseError) {
      return { ...msg, data: undefined, error: result };
    }

    const data = typeof result === 'object' ? result : undefined;

    return { ...msg, data };
  }

  return { ...msg, code: 500, error: ResponseError.new(MESSAGES.unknownAction, 500) };
}
