import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string }
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) throw new AppError(ErrorCodes.UNAUTHORIZED, 'Access token required.', 401)

  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string, (error, decoded) => {
    if (error) throw new AppError(ErrorCodes.TOKEN_EXPIRED, 'Token is invalid or expired.', 403)

    req.user = decoded as { userId: number; email: string }
    next()
  })
}
