import { Response } from 'express';

export interface ApiResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  [key: string]: unknown;
}

export interface ApiResponseShape<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta?: ApiResponseMeta;
  timestamp: string;
  requestId?: string;
}

export class ApiResponse<T = unknown> {
  public readonly success = true as const;
  public readonly timestamp: string;

  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly data: T,
    public readonly meta?: ApiResponseMeta,
    public readonly requestId?: string,
  ) {
    this.timestamp = new Date().toISOString();
  }

  toJSON(): ApiResponseShape<T> {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      ...(this.meta ? { meta: this.meta } : {}),
      timestamp: this.timestamp,
      ...(this.requestId ? { requestId: this.requestId } : {}),
    };
  }

  send(res: Response): Response {
    const requestId = this.requestId ?? (res.req as any)?.id;
    const payload: ApiResponseShape<T> = { ...this.toJSON(), requestId };
    return res.status(this.statusCode).json(payload);
  }

  static ok<T>(res: Response, data: T, message = 'OK', meta?: ApiResponseMeta) {
    return new ApiResponse(200, message, data, meta).send(res);
  }

  static created<T>(res: Response, data: T, message = 'Created', meta?: ApiResponseMeta) {
    return new ApiResponse(201, message, data, meta).send(res);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}

