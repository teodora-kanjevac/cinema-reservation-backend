import type { NextFunction, Request, Response } from 'express'
import { InvoiceService } from '../services/invoiceService'

export const getOrCreateCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId as string)

    const cart = await InvoiceService.getOrCreateActiveCart(userId)

    res.status(200).json(cart)
  } catch (error) {
    next(error)
  }
}

export const addItemToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, timeTableId, price, count } = req.body

    const cartItem = await InvoiceService.addItemToCart(userId, timeTableId, price, count)

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

export const checkoutCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, purchaseId, counterName } = req.body

    await InvoiceService.checkoutCart(userId, purchaseId, counterName)

    res.status(200).json({ message: `User checked out successfully.` })
  } catch (error) {
    next(error)
  }
}
