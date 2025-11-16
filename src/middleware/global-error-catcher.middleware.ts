import { NextFunction, Request, Response } from 'express';
import { HttpException } from '../utils/errors';

export function GlobalErrorCatcherMiddleware(
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  const isHttpException = err instanceof HttpException;

  if (err?.code == null || !isHttpException) {
    res.status(500).send('Internal Server Error');
    return;
  }
  res.status(err.code).send(err.message);
}
