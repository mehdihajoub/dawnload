/**
 * Error types for consistent error categorization
 */
export enum ErrorType {
  API = 'api_error',
  AUTHENTICATION = 'auth_error',
  VALIDATION = 'validation_error',
  PAYMENT = 'payment_error',
  NETWORK = 'network_error',
  UNKNOWN = 'unknown_error',
}

/**
 * Application error class with additional context
 */
export class AppError extends Error {
  public type: ErrorType;
  public context?: Record<string, any>;
  public originalError?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    context?: Record<string, any>,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.context = context;
    this.originalError = originalError;
  }

  /**
   * Creates an API error
   */
  static api(message: string, context?: Record<string, any>, originalError?: unknown): AppError {
    return new AppError(message, ErrorType.API, context, originalError);
  }

  /**
   * Creates an authentication error
   */
  static auth(message: string, context?: Record<string, any>, originalError?: unknown): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, context, originalError);
  }

  /**
   * Creates a validation error
   */
  static validation(message: string, context?: Record<string, any>, originalError?: unknown): AppError {
    return new AppError(message, ErrorType.VALIDATION, context, originalError);
  }

  /**
   * Creates a payment error
   */
  static payment(message: string, context?: Record<string, any>, originalError?: unknown): AppError {
    return new AppError(message, ErrorType.PAYMENT, context, originalError);
  }

  /**
   * Creates a network error
   */
  static network(message: string, context?: Record<string, any>, originalError?: unknown): AppError {
    return new AppError(message, ErrorType.NETWORK, context, originalError);
  }
}

/**
 * Handles errors consistently, logs them, and formats for display
 */
export function handleError(error: unknown): {
  message: string;
  type: ErrorType;
  details?: string;
} {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      details: error.originalError ? String(error.originalError) : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      type: ErrorType.UNKNOWN,
      details: error.stack,
    };
  }

  return {
    message: 'An unexpected error occurred',
    type: ErrorType.UNKNOWN,
    details: String(error),
  };
}

/**
 * Handles fetch response errors
 */
export async function handleFetchResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorData: any = {};

    try {
      errorData = await response.json();
      if (errorData.error || errorData.message) {
        errorMessage = errorData.error || errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the status text
      errorMessage = response.statusText || errorMessage;
    }

    throw AppError.api(errorMessage, {
      status: response.status,
      url: response.url,
      data: errorData,
    });
  }

  return response.json();
}

/**
 * Runs a function with automatic error handling and retries
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number;
    retryDelay?: number;
    errorMessage?: string;
    errorType?: ErrorType;
  } = {}
): Promise<T> {
  const { retries = 0, retryDelay = 1000, errorMessage, errorType } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
  }

  // If we get here, all attempts failed
  if (lastError instanceof AppError) {
    throw lastError;
  }

  throw new AppError(
    errorMessage || 'Operation failed after multiple attempts',
    errorType || ErrorType.UNKNOWN,
    { retries },
    lastError
  );
} 