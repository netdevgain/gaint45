import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';

    let message = 'Internal server error';
    let errors: unknown = null;

    if (typeof payload === 'string') {
      message = payload;
    } else if (typeof payload === 'object' && payload !== null) {
      const typedPayload = payload as { message?: string | string[]; error?: string };
      if (Array.isArray(typedPayload.message)) {
        message = typedPayload.message.join(', ');
        errors = typedPayload.message;
      } else if (typedPayload.message) {
        message = typedPayload.message;
      } else if (typedPayload.error) {
        message = typedPayload.error;
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }
}
