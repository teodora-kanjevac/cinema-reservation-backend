import type { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/userService'

export const getUserInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const user = await UserService.getUserInfo(userId)

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const stats = await UserService.getUserStats(userId)

    res.status(200).json(stats)
  } catch (error) {
    next(error)
  }
}

export const editUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const userPayload = req.body

    const user = await UserService.update(userId, userPayload)

    res.status(200).json(user)
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const { oldPassword, newPassword } = req.body

    await UserService.changePassword(userId, oldPassword, newPassword)

    res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error) {
    next(error)
  }
}
