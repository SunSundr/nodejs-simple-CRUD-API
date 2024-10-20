import { createServer, IncomingMessage, ServerResponse } from 'http';
import { handleRequest } from '../routes/routes';
import { DbMessage } from '../types';

export class App {
  private readonly server: ReturnType<typeof createServer>;
  public port: number;
  private readonly workerIndex: number;
  private readonly actions: Map<string, (msg: DbMessage) => void>;

  constructor() {
    this.port = parseInt(process.env.WORKER_PORT || '4001', 10);
    this.workerIndex = parseInt(process.env.WORKER_INDEX || '1', 10);
    this.server = createServer(this.handleRequest.bind(this));
    this.actions = new Map();

    process.on('message', (msg: DbMessage) => {
      const action = this.actions.get(msg.id);
      if (action) {
        action(msg);
        this.actions.delete(msg.id);
      }
    });
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    console.log(
      `Worker ${this.workerIndex} on port ${this.port} (PID: ${process.pid}) handling request: ${req.method} ${req.url}`
    );
    const data = await handleRequest(req);
    if (data.error) {
      res.writeHead(data.code ?? 404, { 'Content-Type': 'application/json' });
      res.end(data.error.message ?? '');
    } else {
      this.actions.set(data.id, (msg) => {
        res.writeHead(msg.code ?? 200, { 'Content-Type': 'application/json' });
        res.end(msg.data ? JSON.stringify(msg.data) : '');
      });

      process.send?.(data);
    }
  }

  public listen(): void {
    this.server.listen(this.port, () => {
      console.log(
        `Worker ${this.workerIndex} is running on port ${this.port} (PID: ${process.pid})`
      );
      process.send?.('worker-ready');
    });
  }
}
