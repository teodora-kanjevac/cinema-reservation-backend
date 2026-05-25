import { dataSource } from '../config/db'
import { Brackets, IsNull } from 'typeorm'
import { Invoice } from '../models/Invoice'
import { InvoiceItem } from '../models/InvoiceItem'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'

const repository = dataSource.getRepository(Invoice)
const itemRepository = dataSource.getRepository(InvoiceItem)

export class InvoiceService {
  static async getOrCreateActiveCart(userId: number): Promise<Invoice> {
    let cart = await repository.findOne({
      where: { userId, pursTime: IsNull() },
      relations: {
        invoiceItems: {
          timeTable: {
            cinema: true,
          },
        },
      },
    })

    if (!cart) {
      cart = repository.create({
        userId,
        pursTime: null,
        invoiceItems: [],
      })
      await repository.save(cart)
    }

    return cart
  }

  static async getItemCount(userId: number): Promise<number> {
    let cart = await repository.findOne({
      where: { userId, pursTime: IsNull() },
      relations: {
        invoiceItems: {
          timeTable: {
            cinema: true,
          },
        },
      },
    })

    return cart?.invoiceItems.length || 0
  }

  static async addItemsToCart(
    userId: number,
    timeTableId: number,
    seats: Array<{ seatIndex: number; price: number }>,
  ): Promise<InvoiceItem[]> {
    if (!seats.length) throw new AppError(ErrorCodes.NOT_FOUND, 'No seats provided.', 400)

    const cart = await this.getOrCreateActiveCart(userId)

    const seatNumbers = seats.map((s: any) => s.seatIndex)
    const alreadyBooked = await itemRepository
      .createQueryBuilder('item')
      .innerJoin('item.invoice', 'inv')
      .where('item.timeTableId = :ttId', { ttId: timeTableId })
      .andWhere('item.seatNumber IN (:...seats)', { seats: seatNumbers })
      .andWhere(
        new Brackets((qb) => {
          qb.where('inv.pursTime IS NOT NULL').orWhere('inv.invoiceId = :cartId', { cartId: cart.invoiceId })
        }),
      )
      .getMany()

    if (alreadyBooked.length) {
      const taken = alreadyBooked.map((i) => i.seatNumber).join(', ')
      throw new AppError(ErrorCodes.NOT_FOUND, `Seats ${taken} are no longer available.`, 409)
    }

    const newItems = seats.map((seat: any) =>
      itemRepository.create({
        invoiceId: cart.invoiceId,
        timeTableId,
        seatNumber: seat.seatIndex,
        pricePerItem: seat.price,
        count: 1,
        createdAt: new Date(),
        updatedAt: null,
      }),
    )

    return await itemRepository.save(newItems)
  }

  static async removeItemFromCart(invoiceItemId: number): Promise<void> {
    const item = await itemRepository.findOneBy({ invoiceItemId })
    if (!item) throw new AppError(ErrorCodes.NOT_FOUND, `Cart item ${invoiceItemId} not found.`, 404)

    await itemRepository.delete(invoiceItemId)
  }

  static async removeAllItemsFromCart(userId: number): Promise<void> {
    const cart = await repository.findOne({ where: { userId }, select: { invoiceId: true } })

    if (!cart) throw new AppError(ErrorCodes.NOT_FOUND, `Cart ${cart} not found.`, 404)

    await itemRepository.delete({ invoiceId: cart.invoiceId })
  }

  static async checkoutCart(userId: number, purchaseId: string, counterName: string): Promise<Invoice> {
    const cart = await this.getOrCreateActiveCart(userId)

    if (!cart.invoiceItems.length) throw new AppError(ErrorCodes.CANNOT_MODIFY, 'Cart is empty.', 400)

    cart.pursId = purchaseId
    cart.pursTime = new Date()
    cart.pursCounter = counterName

    return await repository.save(cart)
  }
}
