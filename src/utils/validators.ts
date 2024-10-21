import { UserDb } from '../types';

export function testUserDb(obj: unknown): string[] {
  const errors: string[] = [];

  if (typeof obj !== 'object' || obj === null) {
    errors.push('Object is not a valid object or is null');

    return errors;
  }

  const testObj = obj as UserDb;

  if (typeof testObj.username !== 'string') {
    errors.push('Username should be a string');
  }

  if (typeof testObj.age !== 'number') {
    errors.push('Age should be a number');
  }

  if (!Array.isArray(testObj.hobbies)) {
    errors.push('Hobbies should be an array');
  } else if (!testObj.hobbies.every((hobby) => typeof hobby === 'string')) {
    errors.push('All hobbies should be strings');
  }

  const validKeys = ['username', 'age', 'hobbies'];
  const objKeys = Object.keys(testObj);

  if (objKeys.length !== validKeys.length || !objKeys.every((key) => validKeys.includes(key))) {
    errors.push('Object contains unsupported properties');
  }

  return errors;
}
