export enum LogPrefix {
  none = '',
  info = '\x1b[36m[INFO]\x1b[0m', // cyan
  done = '\x1b[32m[DONE]\x1b[0m', // green
  warn = '\x1b[33m[WARN]\x1b[0m', // yellow
  error = '\x1b[31m[ERROR]\x1b[0m', // red
  action = '\x1b[35m[ACTION]\x1b[0m', // magenta
}

export function log(prefix: LogPrefix, ...args: unknown[]): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${prefix} `, ...args);
  }
}

export function err(prefix: LogPrefix, ...args: unknown[]): void {
  console.error(`${prefix} `, ...args);
}
