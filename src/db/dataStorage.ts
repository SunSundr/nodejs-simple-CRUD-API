import { v4 as newUUID4 } from 'uuid';
import { User, UserDb, UUID4 } from '../types';
import { ResponseError } from '../utils/errors';

export class DataStorage {
  private readonly storage: Map<UUID4, UserDb>;

  private readonly notFoundError = (id: string): ResponseError =>
    this.error(`Record with id:${id} doesn't exist`, 404);

  constructor() {
    this.storage = new Map();
  }

  getUser(id: UUID4): User | ResponseError {
    const user = this.storage.get(id);
    if (user) return { id, ...user };

    return this.notFoundError(id);
  }

  setUser(user: UserDb): User {
    const id = newUUID4();
    this.storage.set(id, user);

    return { id, ...user };
  }

  deleteUser(id: UUID4): boolean | ResponseError {
    const isExist = !!this.storage.get(id);
    this.storage.delete(id);

    return isExist ? true : this.notFoundError(id);
  }

  updateUser(id: UUID4, userData: UserDb): User | Error {
    const user = this.storage.get(id);
    if (user) {
      this.storage.set(id, userData);

      return { id, ...userData };
    }

    return this.notFoundError(id);
  }

  allUsers(): User[] {
    return Array.from(this.storage.keys())
      .map((uuid) => this.getUser(uuid))
      .filter((user): user is User => !(user instanceof ResponseError));
  }

  error(msg?: string, code = 500): ResponseError {
    const message = msg || 'Unknown Error';

    return ResponseError.new(message, code);
  }
}
