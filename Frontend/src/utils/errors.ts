/**
 * Professional error handling utilities for the application
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends Error {
  constructor(
    public errors: Record<string, string[]>,
    message = "Validation failed"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Extract user-friendly error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  if (error instanceof ApiError) {
    return error.data?.detail || error.message;
  }
  if (error instanceof ValidationError) {
    return "Please check your input and try again";
  }
  if (error instanceof NetworkError) {
    return "Network error - please check your connection";
  }
  if (error?.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error?.message) {
    return error.message;
  }
  return "An unexpected error occurred";
};

/**
 * Check if user should be logged out based on error
 */
export const shouldLogout = (error: any): boolean => {
  if (error instanceof ApiError) {
    return error.status === 401;
  }
  return error?.response?.status === 401;
};
