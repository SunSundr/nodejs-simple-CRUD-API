import cluster from 'node:cluster';
import * as http from 'node:http';
import { cpus } from 'node:os';
import * as dotenv from 'dotenv';
import { styleText } from 'node:util';
import { App } from './app/app';
import { startDb } from './db/inPrimary';
import { getPort } from './utils/getPort';
import { log, LogPrefix } from './utils/logger';

dotenv.config();
const startPort = getPort(process.env.GRUD_API_PORT);

const isMultiMode = process.env.MODE === 'multi';

if (isMultiMode && cluster.isPrimary) {
  console.log(`Primary ${styleText('yellow', String(process.pid))} is running...`);

  const numCPUs = cpus().length;
  const loadBalancerPort = startPort;
  const workerPorts = Array.from({ length: numCPUs }, (_, i) => loadBalancerPort + 1 + i);

  let workersReady = 0;
  let currentWorkerIndex = 0;

  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork({ WORKER_PORT: workerPorts[i], WORKER_INDEX: i + 1 });

    const handler = (message: string) => {
      if (message === 'worker-ready') {
        workersReady++;

        if (workersReady === numCPUs) {
          log(LogPrefix.info, 'All workers are ready');

          const loadBalancer = http.createServer((req, res) => {
            const targetPort = workerPorts[currentWorkerIndex];

            const options = {
              hostname: 'localhost',
              port: targetPort,
              path: req.url,
              method: req.method,
              headers: req.headers,
            };

            const proxyRequest = http.request(options, (proxyRes) => {
              res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
              proxyRes.pipe(res, { end: true });
            });

            req.pipe(proxyRequest, { end: true });
            currentWorkerIndex = (currentWorkerIndex + 1) % numCPUs;
          });

          loadBalancer.listen(loadBalancerPort, () => {
            startDb();
            console.log(
              LogPrefix.info,
              `Load balancer is running on port ${styleText('yellow', String(loadBalancerPort))}`
            );
            console.log(
              LogPrefix.done,
              'System is fully operational: Load balancer and all workers are running'
            );
            worker.off('message', handler);
          });
        }
      }
    };

    worker.on('message', handler);
  }
} else {
  const app = new App(isMultiMode ? getPort(process.env.WORKER_PORT) : startPort, isMultiMode);
  app.listen();
}
