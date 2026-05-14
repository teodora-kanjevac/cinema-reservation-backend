import type { NextFunction, Request, Response } from 'express'
import { AppError, type ErrorResponse } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction,
): Response<ErrorResponse> {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
      },
    })
  }

  console.error(err)

  const internalError = new AppError(ErrorCodes.INTERNAL_ERROR, 'Something went wrong', 500)

  return res.status(internalError.status).json({
    error: {
      code: internalError.code,
      message: internalError.message,
    },
  })
}
