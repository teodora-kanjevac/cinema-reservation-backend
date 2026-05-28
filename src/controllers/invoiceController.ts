import type { NextFunction, Request, Response } from 'express'
import { InvoiceService } from '../services/invoiceService'

export const getOrCreateCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const cart = await InvoiceService.getOrCreateActiveCart(userId)

    res.status(200).json(cart)
  } catch (error) {
    next(error)
  }
}

export const getItemCountInCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const count = await InvoiceService.getItemCount(userId)

    res.status(200).json(count)
  } catch (error) {
    next(error)
  }
}

export const addItemsToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    const { timeTableId, seats } = req.body

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const cartItem = await InvoiceService.addItemsToCart(userId, timeTableId, seats)

    res.status(200).json(cartItem)
  } catch (error) {
    next(error)
  }
}

export const removeItemFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const itemId = parseInt(req.params.id as string)

    await InvoiceService.removeItemFromCart(itemId)

    res.status(200).json({ message: `Item removed successfully.` })
  } catch (error) {
    next(error)
  }
}

export const removeAllItemsFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    await InvoiceService.removeAllItemsFromCart(userId)

    res.status(200).json({ message: `Item removed successfully.` })
  } catch (error) {
    next(error)
  }
}

export const checkoutCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId
    const { purchaseId, counterName } = req.body

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const invoice = await InvoiceService.checkoutCart(userId, purchaseId, counterName)

    res.status(200).json(invoice)
  } catch (error) {
    next(error)
  }
}

export const getUserBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized access.' })
      return
    }

    const bookings = await InvoiceService.getUserBookings(userId)

    res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}
