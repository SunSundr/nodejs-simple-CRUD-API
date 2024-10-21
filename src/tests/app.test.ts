import request from 'supertest';
import { App } from '../app/app';
import { UserDb } from '../types';
import { MESSAGES } from '../config';

const app = new App(3700, false);
const { server } = app;

describe('User API Tests', () => {
  const testUser: UserDb = {
    username: 'TestUser',
    age: 30,
    hobbies: ['Programming', 'Gaming'],
  };

  let createdUserId: string;

  it('should get an empty array of users', async () => {
    const response = await request(server).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('should create a new user', async () => {
    const response = await request(server).post('/api/users').send(testUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    createdUserId = response.body.id;
  });

  it('should get the created user by ID', async () => {
    const response = await request(server).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(testUser);
  });

  it('should update the created user', async () => {
    const updatedUser: UserDb = {
      ...testUser,
      age: 31,
    };
    const response = await request(server).put(`/api/users/${createdUserId}`).send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(updatedUser);
  });

  it('should delete the created user', async () => {
    const response = await request(server).delete(`/api/users/${createdUserId}`);
    expect(response.status).toBe(204);
  });

  it('should return 404 for deleted user', async () => {
    const response = await request(server).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid user data', async () => {
    const invalidUser = {
      age: 30,
      hobbies: ['Programming'],
    };

    const response = await request(server).post('/api/users').send(invalidUser);
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ message: MESSAGES.bodyInvalid });
  });

  it('should return 404 for incorrect endpoint', async () => {
    const response = await request(server).post('/api/users/bla/bla').send(testUser);
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid hobbies (not all strings)', async () => {
    const invalidUser = {
      ...testUser,
      hobbies: ['Programming', 777, {}], // Неверный тип данных в массиве
    };
    const response = await request(server).post('/api/users').send(invalidUser);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid hobbies (null)', async () => {
    const invalidUser = {
      ...testUser,
      hobbies: null,
    };
    const response = await request(server).post('/api/users').send(invalidUser);
    expect(response.status).toBe(400);
  });

  it('should return 400 for invalid hobbies (undefined)', async () => {
    const invalidUser = {
      ...testUser,
      hobbies: undefined,
    };
    const response = await request(server).post('/api/users').send(invalidUser);
    expect(response.status).toBe(400);
  });

  it('should return 400 for extra properties in request', async () => {
    const invalidUser = {
      ...testUser,
      extraProperty: 'This should not be here',
    };
    const response = await request(server).post('/api/users').send(invalidUser);
    expect(response.body).toMatchObject({ message: MESSAGES.bodyInvalid });
    expect(response.status).toBe(400);
  });
});

afterAll(() => {
  server.close();
});
