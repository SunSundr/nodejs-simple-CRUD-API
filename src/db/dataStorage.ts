import { v4 as newUUID4 } from 'uuid';
import { User, UserDb, UUID4 } from '../types';

export class DataStorage {
  private readonly storage: Map<UUID4, UserDb>;

  constructor() {
    this.storage = new Map();
  }

  getUser(id: UUID4): User | null {
    const user = this.storage.get(id);
    if (user) return { id, ...user };

    return null;
  }

  setUser(user: UserDb): User {
    const id = newUUID4();
    this.storage.set(id, user);

    return { id, ...user };
  }

  deleteUser(id: UUID4): void {
    this.storage.delete(id);
  }

  updateUser(id: UUID4, userData: UserDb): void {
    const user = this.storage.get(id);
    if (user) this.storage.set(id, userData);
  }

  allUsers(): User[] {
    return Array.from(this.storage.keys())
      .map((uuid) => this.getUser(uuid))
      .filter((user) => user !== null);
  }

  error(msg?: string): Error {
    const message = msg || 'Unknown Error';

    return new Error(message);
  }
}
