interface ResponseErrorTest {
  name: string;
  message: string;
  stack?: string;
  code?: number;
  statusCode?: number;
  status?: number;
  headers?: unknown;
  body?: ResponseErrorBody;
}

interface ResponseErrorBody {
  message?: string;
  reason?: string;
  stringData?: string;
  [key: string]: unknown;
}

export type ResponseErrorProperties = {
  name: string;
  message: string;
  statusCode?: number;
  body?: ResponseErrorBody;
};

export class ResponseError extends Error {
  static of = (error: unknown): ResponseError => {
    if (error instanceof ResponseError) return error;
    if (error instanceof Error) {
      const err = error as ResponseErrorTest;
      const code = err.code || err.statusCode || err.status || 0;

      return new ResponseError(error.message, error.name, code, error.stack, err.body);
    }

    if (typeof error === 'string') {
      return new ResponseError(error, 'Error', 0);
    }

    return new ResponseError('Unknown error', 'Error', 0);
  };

  static new = (message: string, statusCode = 0, name = 'error'): ResponseError =>
    new ResponseError(message, name, statusCode);

  private readonly isSerializable = (obj: unknown): boolean => {
    try {
      JSON.stringify(obj);

      return true;
    } catch {
      return false;
    }
  };

  body?: ResponseErrorBody;

  constructor(
    public override message: string,
    public override name: string,
    public statusCode: number,
    public override stack?: string,
    private readonly bodyUnknown?: unknown
  ) {
    super(message);
    this.body = this.parseBody(bodyUnknown);
  }

  private parseBody(bodyUnknown: unknown): ResponseErrorBody | undefined {
    if (typeof bodyUnknown === 'object' && this.isSerializable(bodyUnknown)) {
      return bodyUnknown as ResponseErrorBody;
    }

    if (typeof bodyUnknown === 'string') {
      try {
        return JSON.parse(bodyUnknown);
      } catch {
        return { stringData: bodyUnknown };
      }
    } else if (bodyUnknown !== undefined) {
      return { stringData: String(bodyUnknown) };
    }

    return undefined;
  }

  serialize(): ResponseErrorProperties {
    const body = this.body ? { body: this.body } : {};

    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...body,
    };
  }
}

export function errorMessage(msg: string | undefined | null): { message: string } {
  return { message: msg ?? '?' };
}
