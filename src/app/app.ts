import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { styleText } from 'node:util';
import { parseRequest } from '../routes/routes';
import { DbMessage } from '../types';
import { DataStorage } from '../db/dataStorage';
import { callDb } from '../db/inSingle';
import { errorDetails } from '../utils/errors';

export class App {
  public readonly server!: ReturnType<typeof createServer>;
  public port: number;
  private readonly workerIndex: number;
  private readonly isWorker: boolean;
  private readonly actions?: Map<string, (msg: DbMessage) => void>;
  private readonly storage?: DataStorage;

  constructor(port: number, isWorker: boolean) {
    this.port = port;
    this.isWorker = isWorker;
    this.server = createServer(this.handleRequest.bind(this));
    this.workerIndex = parseInt(process.env.WORKER_INDEX || '1', 10);
    if (this.isWorker) {
      this.actions = new Map();
      process.on('message', (msg: DbMessage) => {
        const action = this.actions?.get(msg.id);
        if (action) {
          action(msg);
          this.actions?.delete(msg.id);
        }
      });
    } else {
      this.storage = new DataStorage();
    }
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const outMsg = this.isWorker
      ? `Worker ${styleText('yellow', String(this.workerIndex))} on port ${styleText('yellow', String(this.port))} (PID: ${styleText(
          'yellow',
          String(process.pid)
        )}) handling request: ${styleText('green', String(req.method))}`
      : `Handling request: ${styleText('green', String(req.method))}`;

    console.log(outMsg);

    const data = await parseRequest(req);

    const endResponse = (msg: DbMessage) => {
      res.writeHead(msg.error ? msg.error.statusCode : (msg.code ?? 200), {
        'Content-Type': 'application/json',
      });
      const strData = msg.data ? JSON.stringify(msg.data) : '';
      res.end(msg.error ? JSON.stringify(errorDetails(msg.error)) : strData);
    };

    if (data.error) {
      res.writeHead(data.error.statusCode ?? 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errorDetails(data.error)));
    } else if (this.isWorker) {
      this.actions?.set(data.id, endResponse);
      process.send?.(data);
    } else if (this.storage) {
      const msg = callDb(data, this.storage);
      endResponse(msg);
    }
  }

  public listen(): void {
    this.server.listen(this.port, () => {
      const outMsg = this.isWorker
        ? `Worker ${styleText('yellow', String(this.workerIndex))} is running on port ${styleText(
            'yellow',
            String(this.port)
          )} (PID: ${styleText('yellow', String(process.pid))})`
        : `Server is running on port ${this.port} (PID: ${styleText('yellow', String(process.pid))})`;
      console.log(outMsg);
      if (this.isWorker) process.send?.('worker-ready');
    });
  }
}
