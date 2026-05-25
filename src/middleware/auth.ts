import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'

export interface AuthenticatedRequest extends Request {
  user?: { userId: number; email: string }
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { accessToken, refreshToken } = req.cookies

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET as string) as {
        userId: number
        email: string
      }
      req.user = { userId: decoded.userId, email: decoded.email }
      return next()
    } catch (error) {}
  }

  if (!refreshToken) throw new AppError(ErrorCodes.UNAUTHORIZED, 'Authentication required.', 401)

  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
      userId: number
      email: string
    }

    const userPayload = { userId: decodedRefresh.userId, email: decodedRefresh.email }

    const accessToken = jwt.sign(userPayload, process.env.JWT_ACCESS_SECRET as string, { expiresIn: '15m' })

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    })

    req.user = userPayload
    next()
  } catch (refreshError) {
    new AppError(ErrorCodes.TOKEN_EXPIRED, 'Session expired. Please log in again.', 401)
  }
}
