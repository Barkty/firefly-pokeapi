import { Request, Response } from 'express';
import { ExpressController } from '../types';

export const WatchAsyncController =
  (fn: ExpressController) => (req: Request, res: Response) => {
    Promise.resolve(fn(req, res)).catch((error) => {
      return res.status(500).json({
        status: false,
        message:
          'We encountered a problem while processing your request. Please try again',
        errors: error.errors || error.message
      });
    });
  };
