import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    // Get custom message from decorator
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        // Determine the message to use
        const message = customMessage || data?.message || 'Request successful';

        // If we have a custom message, remove the message from the data
        let responseData = data;
        if (customMessage && data?.message) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { message: _, ...dataWithoutMessage } = data;
          responseData =
            Object.keys(dataWithoutMessage).length > 0
              ? dataWithoutMessage
              : undefined;
        }

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data: responseData,
        };
      }),
    );
  }
}
