import type { DataStorage } from './db/dataStorage';
import type { ResponseError } from './utils/errors';

export interface UserDb {
  username: string;
  age: number;
  hobbies: string[];
}

export interface User extends UserDb {
  readonly id: string;
}

export type UUID4 = string;

export interface DbMessage {
  id: string;
  code?: number;
  action: keyof DataStorage;
  data?: unknown;
  error?: ResponseError;
}
