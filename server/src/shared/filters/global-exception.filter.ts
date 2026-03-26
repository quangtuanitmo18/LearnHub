import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    if (exception instanceof BadRequestException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Handle validation errors
      if (
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        message = 'Validation failed';
        errors = this.formatValidationErrors(exceptionResponse.message);
      } else {
        message = exceptionResponse.message || exception.message;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;
    } else if (exception instanceof Error) {
      // Handle Mongoose validation errors
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Validation failed';
        errors = this.formatMongooseValidationErrors(exception);
      } else {
        message = exception.message;
      }
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(
    validationErrors: string[],
  ): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    validationErrors.forEach((error: string) => {
      // Parse validation error messages to extract field and message
      if (error.includes('must be') || error.includes('should not be empty')) {
        const field = this.extractFieldFromError(error);
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(this.formatErrorMessage(error));
      }
    });

    return errors;
  }

  private formatMongooseValidationErrors(error: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    if (error.errors) {
      Object.keys(error.errors).forEach((field) => {
        errors[field] = [error.errors[field].message];
      });
    }

    return errors;
  }

  private extractFieldFromError(error: string): string {
    // Extract field name from validation error messages
    const fieldMatch = error.match(/^(\w+)\s/);
    return fieldMatch ? fieldMatch[1] : 'unknown';
  }

  private formatErrorMessage(error: string): string {
    // Clean up error messages
    return error
      .replace(/^(\w+)\s/, '') // Remove field name prefix
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
}
