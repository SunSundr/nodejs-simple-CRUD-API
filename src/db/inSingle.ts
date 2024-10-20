import { DataStorage } from './dataStorage';
import { UserDb, DbMessage } from '../types';

export function callDb(msg: DbMessage, storage: DataStorage): DbMessage {
  const { action } = msg;
  if (typeof storage[action] === 'function') {
    const params = msg.data ?? [];
    const result = storage[action](...(params as [string & UserDb, UserDb]));
    const data = typeof result === 'object' ? result : undefined;

    return { ...msg, data };
  }

  return { ...msg, code: 500, error: new Error('Unknown Action') };
}
