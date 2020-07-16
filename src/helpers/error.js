// @flow
import { Response } from 'express';

class ErrorHandler extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
      super();
      this.statusCode = statusCode || 500;
      this.message = message;
  }
}

const handleError = (err: ErrorHandler, res: Response) => {
    if (!(err instanceof ErrorHandler)) {
        err.statusCode = 500;
    }
    const { statusCode, message } = err;
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
    });
};

export { handleError, ErrorHandler };
