import { dataSource } from '../config/db'
import { Brackets, IsNull, Not } from 'typeorm'
import { Invoice } from '../models/Invoice'
import { InvoiceItem } from '../models/InvoiceItem'
import { AppError } from '../errors/AppError'
import { ErrorCodes } from '../errors/errorCodes'
import dayjs from 'dayjs'
import { MovieService } from './movieService'
import { formatSeatLabel } from '../utils/seat'

const repository = dataSource.getRepository(Invoice)
const itemRepository = dataSource.getRepository(InvoiceItem)

export class InvoiceService {
  static async getById(invoiceId: number, userId: number): Promise<Invoice> {
    const invoice = await repository.findOne({
      where: { invoiceId, userId },
      relations: {
        invoiceItems: {
          timeTable: {
            cinema: true,
          },
        },
      },
    })

    if (!invoice) throw new AppError(ErrorCodes.NOT_FOUND, `Invoice with id ${invoiceId} not found.`, 404)

    return invoice
  }

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
    const cart = await repository.findOne({
      where: {
        userId,
        pursId: IsNull(),
        pursTime: IsNull(),
        pursCounter: IsNull(),
      },
      select: { invoiceId: true },
    })

    if (!cart) throw new AppError(ErrorCodes.NOT_FOUND, `Cart ${cart} not found.`, 404)

    await itemRepository.delete({ invoiceId: cart.invoiceId })
  }

  static async checkoutCart(userId: number, purchaseId: string, counterName: string): Promise<any> {
    const cart = await this.getOrCreateActiveCart(userId)

    if (!cart.invoiceItems.length) throw new AppError(ErrorCodes.CANNOT_MODIFY, 'Cart is empty.', 400)

    cart.pursId = purchaseId
    cart.pursTime = new Date()
    cart.pursCounter = counterName

    const invoice = await repository.save(cart)

    const firstItem = invoice.invoiceItems[0]
    const timeTable = firstItem?.timeTable
    const cinemaName = timeTable?.cinema?.name || '-'
    const screenDetails = timeTable?.screenType ? ` (${timeTable.screenType})` : ''
    const movieTitle = timeTable?.movieId ? (await MovieService.getById(timeTable?.movieId)).title : 'N/A'
    const displayCinema = `${cinemaName}${screenDetails}`.trim()
    const displayDate = timeTable?.screeningDate ? dayjs(timeTable.screeningDate).format('MMM DD, YYYY') : 'N/A'
    const displayTime = timeTable?.startTime ? timeTable.startTime.substring(0, 5) : '00:00'
    const seatLabels =
      invoice.invoiceItems
        .map((item) => formatSeatLabel(item.seatNumber))
        .filter(Boolean)
        .join(', ') || 'N/A'
    const totalAmount = invoice.invoiceItems.reduce((sum, item) => sum + item.pricePerItem, 0)

    return {
      movieTitle,
      displayCinema,
      displayDate,
      displayTime,
      seatLabels,
      totalAmount,
    }
  }

  static async getUserBookings(userId: number): Promise<Invoice[]> {
    return await repository.find({
      where: {
        user: { userId },
        pursId: Not(IsNull()),
        pursTime: Not(IsNull()),
        pursCounter: Not(IsNull()),
      },
      relations: {
        invoiceItems: {
          timeTable: {
            cinema: true,
          },
        },
      },
      order: {
        pursTime: 'DESC',
      },
    })
  }
}
