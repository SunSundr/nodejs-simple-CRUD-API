import net from 'net';

export function getPort(portString: string | undefined): number {
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

export function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(false);
        } else {
          resolve(true);
        }
      })
      .once('listening', () => tester.once('close', () => resolve(true)).close())
      .listen(port);
  });
}
