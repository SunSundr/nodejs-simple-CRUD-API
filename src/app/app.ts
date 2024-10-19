import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import * as dotenv from 'dotenv';

export class App {
  private server: ReturnType<typeof createServer>;

  public port: number;

  constructor() {
    dotenv.config();
    this.port = this.getPort();
    this.server = createServer(this.handleRequest.bind(this));
  }

  private getPort(): number {
    const portString = process.env.GRUD_API_PORT;
    if (portString === undefined) {
      throw new Error(
        'Port must be a number specified in the .env file. Please refer to the .env.example file for guidance.'
      );
    }

    const port = parseInt(portString, 10);

    if (Number.isNaN(port) || port <= 0 || port > 65535) {
      throw new Error(
        'Port must be a positive number between 1 and 65535, specified in the .env file.' +
          'Please refer to the .env.example file for guidance.'
      );
    }

    return port;
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse) {
    console.log('> API:', req.method);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('DATA');
  }

  public listen(): void {
    this.server.listen(this.port, () => {
      console.log('-'.repeat(40));
      console.log(`Server is running on port ${this.port}`);
    });
  }
}
