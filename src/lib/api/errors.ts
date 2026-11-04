/**
 * Zuri Typed Error Classes
 * Safe for import in both Server and Client Components.
 */

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly errorType?: string;
  public readonly userId?: string;
  public readonly responseBody?: unknown;

  constructor(
    status: number,
    message: string,
    options?: {
      code?: string;
      errorType?: string;
      userId?: string;
      responseBody?: unknown;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.errorType = options?.errorType;
    this.userId = options?.userId;
    this.responseBody = options?.responseBody;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class RateLimitedError extends ApiError {
  /**
   * Unix epoch timestamp in seconds when the rate limit window resets.
   */
  public readonly resetTime: number | null;
  public readonly resetDate: Date | null;

  constructor(message: string, resetTime: number | null, responseBody?: unknown) {
    super(429, message, {
      code: 'RATE_LIMITED',
      responseBody,
    });
    this.name = 'RateLimitedError';
    this.resetTime = resetTime;
    this.resetDate = resetTime ? new Date(resetTime * 1000) : null;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message: string, responseBody?: unknown) {
    super(503, message, {
      code: 'CIRCUIT_BREAKER_OPEN',
      responseBody,
    });
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
