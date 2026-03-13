import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[error]', err.message);

  if (err instanceof MongooseError.ValidationError) {
    res.status(400).json({ message: err.message });
    return;
  }

  if ((err as any).code === 11000) {
    res.status(409).json({ message: 'Duplicate key: resource already exists' });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
};
