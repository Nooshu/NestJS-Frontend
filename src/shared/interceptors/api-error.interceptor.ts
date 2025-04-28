import {
  type CallHandler,
  type ExecutionContext,
  HttpException,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Interceptor for handling API errors and retrying failed requests.
 * This interceptor provides automatic retry logic for failed API requests
 * and standardizes error responses from external APIs.
 *
 * @class ApiErrorInterceptor
 * @description Handles API errors and implements retry logic
 */
@Injectable()
export class ApiErrorInterceptor implements NestInterceptor {
  /**
   * Intercepts HTTP requests and responses to handle errors and retry failed requests.
   *
   * @method intercept
   * @param {ExecutionContext} context - The execution context
   * @param {CallHandler} next - The next handler in the chain
   * @returns {Observable<any>} An observable that emits the response or error
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // Retry failed requests up to 3 times before giving up
      retry(3),
      catchError((error) => {
        if (error.response) {
          // Transform Java API specific errors into standardized error responses
          return throwError(
            () =>
              new HttpException(
                {
                  status: error.response.status,
                  error: error.response.data.message || 'An error occurred',
                  timestamp: new Date().toISOString(),
                  path: context.switchToHttp().getRequest().url,
                },
                error.response.status
              )
          );
        }
        // If it's not an API error, pass it through
        return throwError(() => error);
      })
    );
  }
}
