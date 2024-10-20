import { IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import { validate as isUUID } from 'uuid';
import { DbMessage } from '../types';
import { isUserDb } from '../utils/validators';
import { ResponseError } from '../utils/errors';
import { MESSAGES } from '../config';

async function getRequestBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => {
      reject(error);
    });
  });
}

export async function parseRequest(req: IncomingMessage): Promise<DbMessage> {
  const parsedUrl = parse(req.url || '', true);
  const { pathname } = parsedUrl;
  const id = `${process.pid}-${Date.now()}`;

  const endpointInvalid = (): DbMessage => ({
    id,
    code: 404,
    action: 'error',
    error: ResponseError.new(MESSAGES.endpointInvalid, 404),
  });

  if (!pathname || !/^\/api\/users(\/|$)/.test(pathname)) {
    console.log(404, 'Not found');

    return endpointInvalid();
  }

  const segments = pathname.split('/').filter(Boolean);
  const userId = segments[segments.length - 1];

  if (segments.length > 3) return endpointInvalid();

  if (segments.length === 3 && !isUUID(userId)) {
    console.log('Invalid userId', 404);

    return {
      id,
      code: 400,
      action: 'error',
      error: ResponseError.new(MESSAGES.uuidInvalid, 400),
    };
  }

  switch (req.method) {
    case 'GET':
      if (segments.length === 2) {
        console.log('allUsers');

        return { id, action: 'allUsers' };
      }

      if (segments.length === 3) {
        console.log('getUser');

        return { id, action: 'getUser', data: [userId] };
      }

      // never:
      return {
        id,
        code: 404,
        action: 'error',
        error: ResponseError.new(MESSAGES.notFound, 400),
      };

    case 'POST': {
      if (segments.length > 2) return endpointInvalid();
      const body = await getRequestBody(req);
      console.log('setUser');
      if (isUserDb(body)) {
        return { id, code: 201, action: 'setUser', data: [body] };
      }

      return {
        id,
        code: 400,
        action: 'error',
        error: ResponseError.new(MESSAGES.bodyInvalid, 400),
      };
    }

    case 'PUT': {
      const body = await getRequestBody(req);
      console.log('updateUser');
      if (isUserDb(body)) {
        return { id, action: 'updateUser', data: [userId, body] };
      }

      return {
        id,
        code: 400,
        action: 'error',
        error: ResponseError.new(MESSAGES.bodyInvalid, 400),
      };
    }

    case 'DELETE':
      console.log('deleteUser');

      return { id, code: 204, action: 'deleteUser', data: [userId] };

    default:
      return {
        id,
        code: 405,
        action: 'error',
        error: ResponseError.new(MESSAGES.notAllowed, 405),
      };
  }
}
