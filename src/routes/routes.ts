import { IncomingMessage } from 'node:http';
import { parse } from 'node:url';
import { validate as isUUID } from 'uuid';
import { DbMessage } from '../types';

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

  if (!pathname || !/^\/api\/users(\/|$)/.test(pathname)) {
    console.log(404, 'Not found');

    return { id, code: 404, action: 'error', error: new Error('Not found, 404') };
  }

  const segments = pathname.split('/').filter(Boolean);
  const userId = segments[segments.length - 1];

  console.log(segments, userId);

  if (segments.length === 3 && !isUUID(userId)) {
    console.log('Invalid userId', 404);

    return { id, code: 404, action: 'error', error: new Error('Invalid userId, 404') };
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

      return { id, code: 500, action: 'error', error: new Error('Not found, 500') };

      break;
    case 'POST': {
      const body = await getRequestBody(req);
      console.log('setUser', body);

      return { id, action: 'setUser', data: [body] };
    }

    case 'PUT': {
      const body = await getRequestBody(req);
      console.log('updateUser', body);

      return { id, action: 'updateUser', data: [userId, body] };
    }

    case 'DELETE':
      console.log('deleteUser');

      return { id, action: 'deleteUser', data: [userId] };

    default:
      return { id, code: 404, action: 'error', error: new Error('Not found, 500') };
  }
}
