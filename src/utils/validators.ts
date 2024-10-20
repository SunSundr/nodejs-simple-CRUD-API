import { UserDb } from '../types';

export function isUserDb(obj: unknown): obj is UserDb {
  const testObj = obj as UserDb;

  return (
    typeof testObj.username === 'string' &&
    typeof testObj.age === 'number' &&
    Array.isArray(testObj.hobbies) &&
    testObj.hobbies.every((hobby: unknown) => typeof hobby === 'string')
  );
}
