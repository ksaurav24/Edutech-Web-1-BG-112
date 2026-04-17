export interface ApiErrorMeta {
  [key: string]: unknown;
}

export interface ApiErrorShape {
  success: false;
  statusCode: number;
  message: string;
  code: string;
  data: null;
  errors?: unknown[];
  meta?: ApiErrorMeta;
  timestamp: string;
  requestId?: string;
  stack?: string;
}

export class ApiError extends Error {
  public readonly success = false as const;
  public readonly timestamp: string;
  public readonly isOperational: boolean;

  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string = 'INTERNAL_ERROR',
    public readonly errors: unknown[] = [],
    public readonly meta?: ApiErrorMeta,
    public requestId?: string,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(message);
    this.name = new.target.name;
    this.timestamp = new Date().toISOString();
    this.isOperational = options?.isOperational ?? true;
    if (options?.cause !== undefined) (this as any).cause = options.cause;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(includeStack = false): ApiErrorShape {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      data: null,
      ...(this.errors.length ? { errors: this.errors } : {}),
      ...(this.meta ? { meta: this.meta } : {}),
      timestamp: this.timestamp,
      ...(this.requestId ? { requestId: this.requestId } : {}),
      ...(includeStack && this.stack ? { stack: this.stack } : {}),
    };
  }

  static from(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof Error) {
      return new InternalServerError(err.message, [], undefined, { cause: err, isOperational: false });
    }
    return new InternalServerError('Unknown error', [], undefined, { cause: err, isOperational: false });
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', errors: unknown[] = [], meta?: ApiErrorMeta) {
    super(400, message, 'BAD_REQUEST', errors, meta);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized', errors: unknown[] = [], meta?: ApiErrorMeta) {
    super(401, message, 'UNAUTHORIZED', errors, meta);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden', errors: unknown[] = [], meta?: ApiErrorMeta) {
    super(403, message, 'FORBIDDEN', errors, meta);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found', errors: unknown[] = [], meta?: ApiErrorMeta) {
    super(404, message, 'NOT_FOUND', errors, meta);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict', errors: unknown[] = [], meta?: ApiErrorMeta) {
    super(409, message, 'CONFLICT', errors, meta);
  }
}

export class InternalServerError extends ApiError {
  constructor(
    message = 'Internal Server Error',
    errors: unknown[] = [],
    meta?: ApiErrorMeta,
    options?: { cause?: unknown; isOperational?: boolean },
  ) {
    super(500, message, 'INTERNAL_ERROR', errors, meta, undefined, {
      isOperational: false,
      ...options,
    });
  }
}

