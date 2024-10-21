import { IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import { validate as isUUID } from 'uuid';
import { DbMessage } from '../types';
import { testUserDb } from '../utils/validators';
import { ResponseError } from '../utils/errors';
import { log, err, LogPrefix } from '../utils/logger';
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

  const endpointInvalid = (): DbMessage => {
    err(LogPrefix.error, MESSAGES.endpointInvalid, 404);

    return {
      id,
      code: 404,
      action: 'error',
      error: ResponseError.new(MESSAGES.endpointInvalid, 404),
    };
  };

  const jsonInvalid = (): DbMessage => {
    err(LogPrefix.error, MESSAGES.jsonInvalid, 400);

    return {
      id,
      code: 400,
      action: 'error',
      error: ResponseError.new(MESSAGES.jsonInvalid, 400),
    };
  };

  if (!pathname || !/^\/api\/users(\/|$)/.test(pathname)) {
    return endpointInvalid();
  }

  const segments = pathname.split('/').filter(Boolean);
  const userId = segments[segments.length - 1];

  if (segments.length > 3) return endpointInvalid();

  if (segments.length === 3 && !isUUID(userId)) {
    err(LogPrefix.error, MESSAGES.uuidInvalid, 400);

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
        log(LogPrefix.action, 'allUsers');

        return { id, action: 'allUsers' };
      }

      if (segments.length === 3) {
        log(LogPrefix.action, 'getUser');

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
      if (segments.length !== 2) return endpointInvalid();
      try {
        const body = await getRequestBody(req);
        log(LogPrefix.action, 'setUser');
        const validateBody = testUserDb(body);
        if (validateBody.length === 0) {
          return { id, code: 201, action: 'setUser', data: [body] };
        }

        log(LogPrefix.error, MESSAGES.bodyInvalid, 400);

        return {
          id,
          code: 400,
          action: 'error',
          error: ResponseError.new(MESSAGES.bodyInvalid, 400, validateBody),
        };
      } catch {
        return jsonInvalid();
      }
    }

    case 'PUT': {
      try {
        const body = await getRequestBody(req);
        log(LogPrefix.action, 'updateUser');
        const validateBody = testUserDb(body);
        if (validateBody.length === 0) {
          return { id, action: 'updateUser', data: [userId, body] };
        }

        log(LogPrefix.error, MESSAGES.bodyInvalid, 400);

        return {
          id,
          code: 400,
          action: 'error',
          error: ResponseError.new(MESSAGES.bodyInvalid, 400, validateBody),
        };
      } catch {
        return jsonInvalid();
      }
    }

    case 'DELETE':
      log(LogPrefix.action, 'deleteUser');

      return { id, code: 204, action: 'deleteUser', data: [userId] };

    default:
      log(LogPrefix.error, MESSAGES.notAllowed, 405);

      return {
        id,
        code: 405,
        action: 'error',
        error: ResponseError.new(MESSAGES.notAllowed, 405),
      };
  }
}
