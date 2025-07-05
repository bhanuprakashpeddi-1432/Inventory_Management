import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: error.details || error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: error.message
    });
  }

  if (error.code === 'P2002') { // Prisma unique constraint error
    return res.status(409).json({
      error: 'Conflict',
      message: 'A record with this data already exists'
    });
  }

  if (error.code === 'P2025') { // Prisma record not found
    return res.status(404).json({
      error: 'Not Found',
      message: 'The requested resource was not found'
    });
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
