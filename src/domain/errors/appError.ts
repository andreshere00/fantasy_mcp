export interface AppErrorOptions {
    cause?: unknown;
  }
  
  export class AppError extends Error {
    public readonly cause?: unknown;
  
    constructor(message: string, options?: AppErrorOptions) {
      super(message);
      this.name = new.target.name;
      this.cause = options?.cause;
  
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, new.target);
      }
    }
  }