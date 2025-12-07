import { AppError, type AppErrorOptions } from "./appError.js";

export interface ScrapingErrorOptions extends AppErrorOptions {
  playerSlug?: string;
  step?: string;
}

export class ScrapingError extends AppError {
  public readonly playerSlug?: string | undefined;
  public readonly step?: string | undefined;

  constructor(message: string, options?: ScrapingErrorOptions) {
    super(message, options);
    this.playerSlug = options?.playerSlug;
    this.step = options?.step;
  }
}