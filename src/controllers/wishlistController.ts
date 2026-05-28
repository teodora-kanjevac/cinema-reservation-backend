import type { Request, Response, NextFunction } from 'express'
import { WishlistService } from '../services/wishlistService'

export const getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const wishlist = await WishlistService.getOrCreateWishlist(userId)

    res.status(200).json(wishlist)
  } catch (err) {
    next(err)
  }
}

export const addToWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const { movieId } = req.body

    await WishlistService.addItem(userId, Number(movieId))

    res.status(201).json({ success: true })
  } catch (err) {
    next(err)
  }
}

export const removeFromWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const { movieId } = req.params

    await WishlistService.removeItem(userId, Number(movieId))

    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
