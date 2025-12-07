import { AppError, type AppErrorOptions } from "./appError.js";

export interface HttpErrorOptions extends AppErrorOptions {
  url: string;
  statusCode?: number; // type: number | undefined
}

export class HttpError extends AppError {
  public readonly url: string;
  public readonly statusCode: number | undefined;

  constructor(message: string, options: HttpErrorOptions) {
    super(message, options);
    this.url = options.url;
    this.statusCode = options.statusCode;
  }
}