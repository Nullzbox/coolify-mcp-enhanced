/**
 * Helper functions for MCP tools
 * Standardizes error handling and response formatting
 */

/**
 * Standard error response format
 */
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: any;
    stack?: string;
  };
  operation?: string;
  timestamp: string;
}

/**
 * Standard success response format
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  count?: number;
  pagination?: any;
}

/**
 * Format error for consistent error responses
 */
export function formatToolError(error: any, operation: string, additionalContext?: any): ErrorResponse {
  const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
  const errorCode = error?.code || error?.response?.status?.toString() || 'UNKNOWN_ERROR';

  // Extract all available error details
  const details: any = {
    ...additionalContext
  };

  // Include API response data if available
  if (error?.response?.data) {
    details.apiResponse = error.response.data;
  }

  // Include error details if available
  if (error?.details) {
    details.errorDetails = error.details;
  }

  // Include validation errors if present
  if (error?.response?.data?.errors) {
    details.validationErrors = error.response.data.errors;
  }

  // Include any other error properties
  if (error?.response?.data?.message && error.response.data.message !== errorMessage) {
    details.apiMessage = error.response.data.message;
  }

  return {
    success: false,
    error: {
      message: errorMessage,
      code: errorCode,
      details: Object.keys(details).length > 0 ? details : undefined,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    },
    operation,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format success response for consistency
 */
export function formatToolSuccess<T>(data: T, message?: string, additionalInfo?: any): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    ...additionalInfo
  };
}

/**
 * Wrap a tool handler with try/catch and standardized error handling
 */
export function wrapToolHandler<TArgs, TResult>(
  toolName: string,
  handler: (args: TArgs) => Promise<TResult>
) {
  return async (args: TArgs): Promise<{ content: Array<{ type: string; text: string }> }> => {
    try {
      const result = await handler(args);
      const response = typeof result === 'object' && result !== null && 'success' in result
        ? result
        : formatToolSuccess(result);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(response, null, 2)
        }]
      };
    } catch (error: any) {
      const errorResponse = formatToolError(error, toolName, { args });

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(errorResponse, null, 2)
        }]
      };
    }
  };
}

/**
 * Truncate large strings to prevent token overflow
 */
export function truncateLargeString(value: string, maxLength: number = 10000): string {
  if (value && value.length > maxLength) {
    return value.substring(0, maxLength) + '\n... [truncated - content too large]';
  }
  return value;
}

/**
 * Truncate large log arrays
 */
export function truncateLogs(logs: any, maxLength: number = 10000): any {
  if (!logs) return logs;

  if (typeof logs === 'string' && logs.length > maxLength) {
    return truncateLargeString(logs, maxLength);
  }

  if (Array.isArray(logs) && JSON.stringify(logs).length > maxLength) {
    return logs.slice(-20); // Keep last 20 entries
  }

  return logs;
}
