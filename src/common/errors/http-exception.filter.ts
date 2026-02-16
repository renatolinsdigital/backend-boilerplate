import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  NotImplementedException,
  BadGatewayException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'object' ? (exceptionResponse as Record<string, unknown>) : {};

    let message = exception.message || 'Internal Server Error';
    let errorType = (error.error as string) || 'Error';

    // Handle specific exception types
    if (exception instanceof BadRequestException) {
      errorType = 'Bad Request';
      message = (error.message as string) || 'The request body contains invalid data';
    } else if (exception instanceof UnauthorizedException) {
      errorType = 'Unauthorized';
      message = (error.message as string) || 'Authentication is required';
    } else if (exception instanceof ForbiddenException) {
      errorType = 'Forbidden';
      message = (error.message as string) || 'Access denied to this resource';
    } else if (exception instanceof NotFoundException) {
      errorType = 'Not Found';
      message = (error.message as string) || 'Resource not found';
    } else if (exception instanceof ConflictException) {
      errorType = 'Conflict';
      message = (error.message as string) || 'Resource conflict';
    } else if (exception instanceof InternalServerErrorException) {
      errorType = 'Internal Server Error';
      message = (error.message as string) || 'An internal server error occurred';
      this.logger.error(`Internal Server Error: ${message}`, exception.stack);
    } else if (exception instanceof NotImplementedException) {
      errorType = 'Not Implemented';
      message = (error.message as string) || 'This feature is not implemented';
    } else if (exception instanceof BadGatewayException) {
      errorType = 'Bad Gateway';
      message = (error.message as string) || 'Bad gateway response';
    } else if (exception instanceof ServiceUnavailableException) {
      errorType = 'Service Unavailable';
      message = (error.message as string) || 'Service is temporarily unavailable';
    } else if (exception instanceof GatewayTimeoutException) {
      errorType = 'Gateway Timeout';
      message = (error.message as string) || 'Gateway timeout';
    }

    // Log warnings for 4xx status codes
    if (status >= 400 && status < 500) {
      this.logger.warn(`${status} ${errorType}: ${message} - Path: ${request.url}`);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: errorType,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }
}
