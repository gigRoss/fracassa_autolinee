import { getDb } from './db';
import { httpRequestLogs, NewHttpRequestLog } from './schema';
import { NextRequest } from 'next/server';

const HTTP_STATUS_TEXT: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

function getStatusText(code: number): string {
  return HTTP_STATUS_TEXT[code] || `Status ${code}`;
}

export interface LogRequestOptions {
  request: NextRequest;
  statusCode: number;
  durationMs?: number;
  responseSize?: number;
  error?: Error | { message?: string; code?: string; stack?: string; type?: string };
  errorCode?: string;
  sessionId?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: unknown;
  info?: Record<string, unknown>;
}

/**
 * Log an HTTP request to the database
 */
export async function logRequest(options: LogRequestOptions) {
  try {
    const db = getDb();
    const { request, statusCode, durationMs, responseSize, error, errorCode, sessionId, requestBody, responseBody, info } = options;

    // Query params
    const queryParams: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // IP address (Vercel headers)
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || null;

    // Headers (sanitized)
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      if (!['authorization', 'cookie', 'x-api-key'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Error details
    let errorMessage: string | null = null;
    let errorStack: string | null = null;
    let errorType: string | null = null;
    let resolvedErrorCode: string | null = errorCode || null;

    if (error) {
      if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || null;
        errorType = error.constructor.name;
        if ('code' in error && typeof error.code === 'string') {
          resolvedErrorCode = resolvedErrorCode || error.code;
        }
      } else {
        errorMessage = error.message || null;
        errorStack = error.stack || null;
        errorType = error.type || null;
        resolvedErrorCode = resolvedErrorCode || error.code || null;
      }
    }

    // Truncate response body (max 5KB)
    let truncatedResponseBody: string | null = null;
    if (responseBody !== undefined) {
      const responseStr = typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody);
      truncatedResponseBody = responseStr.length > 5000 ? responseStr.substring(0, 5000) + '...[TRUNCATED]' : responseStr;
    }

    const logEntry: NewHttpRequestLog = {
      method: request.method,
      path: request.nextUrl.pathname,
      queryParams: Object.keys(queryParams).length > 0 ? JSON.stringify(queryParams) : null,
      statusCode,
      statusText: getStatusText(statusCode),
      durationMs: durationMs || null,
      userAgent: request.headers.get('user-agent') || null,
      ipAddress,
      referer: request.headers.get('referer') || null,
      requestBody: requestBody ? JSON.stringify(sanitizeBody(requestBody)) : null,
      responseSize: responseSize || null,
      errorMessage,
      errorCode: resolvedErrorCode,
      errorStack,
      errorType,
      responseBody: truncatedResponseBody,
      requestHeaders: JSON.stringify(headers),
      info: info ? JSON.stringify(info) : null,
      sessionId: sessionId || null,
      timestamp: new Date(),
    };

    await db.insert(httpRequestLogs).values(logEntry);
  } catch (err) {
    console.error('Failed to log request:', err);
  }
}

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization', 'credit_card', 'cvv'];
  const sanitized = { ...body };
  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

export function startTimer() {
  const startTime = performance.now();
  return { elapsed: () => Math.round(performance.now() - startTime) };
}

/**
 * Wrap API handler with automatic logging
 */
export function withRequestLogging(handler: (request: NextRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const timer = startTimer();
    try {
      const response = await handler(request);
      logRequest({ request, statusCode: response.status, durationMs: timer.elapsed() }).catch(console.error);
      return response;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logRequest({ request, statusCode: 500, durationMs: timer.elapsed(), error, errorCode: 'UNHANDLED_EXCEPTION' }).catch(console.error);
      throw err;
    }
  };
}

/**
 * Log an error manually
 */
export async function logError(request: NextRequest, error: unknown, options?: { statusCode?: number; errorCode?: string; info?: Record<string, unknown>; durationMs?: number }) {
  const err = error instanceof Error ? error : new Error(String(error));
  await logRequest({ request, statusCode: options?.statusCode || 500, error: err, errorCode: options?.errorCode, info: options?.info, durationMs: options?.durationMs });
}

