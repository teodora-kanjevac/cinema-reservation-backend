import { dataSource } from '../config/db'
import { IsNull } from 'typeorm'
import { Invoice } from '../models/Invoice'
import { InvoiceItem } from '../models/InvoiceItem'

export class InvoiceService {
  static async getOrCreateActiveCart(userId: number): Promise<Invoice> {
    const invoiceRepository = dataSource.getRepository(Invoice)

    let cart = await invoiceRepository.findOne({
      where: { userId, pursTime: IsNull() },
      relations: ['invoiceItems', 'invoiceItems.timeTable'],
    })

    if (!cart) {
      cart = invoiceRepository.create({
        userId,
        pursTime: null,
        invoiceItems: [],
      })
      await invoiceRepository.save(cart)
    }

    return cart
  }

  static async addItemToCart(userId: number, timeTableId: number, price: number, count: number) {
    const itemRepository = dataSource.getRepository(InvoiceItem)

    const cart = await this.getOrCreateActiveCart(userId)

    let item = await itemRepository.findOne({
      where: { invoiceId: cart.invoiceId, timeTableId },
    })

    if (item) {
      item.count += count
    } else {
      item = itemRepository.create({
        invoiceId: cart.invoiceId,
        timeTableId,
        pricePerItem: price,
        count,
      })
    }

    return await itemRepository.save(item)
  }

  static async removeItemFromCart(invoiceItemId: number) {
    const itemRepository = dataSource.getRepository(InvoiceItem)
    await itemRepository.delete(invoiceItemId)
  }

  static async checkoutCart(userId: number, purchaseId: string, counterName: string) {
    const invoiceRepository = dataSource.getRepository(Invoice)

    const cart = await this.getOrCreateActiveCart(userId)

    cart.pursId = purchaseId
    cart.pursTime = new Date()
    cart.pursCounter = counterName

    await invoiceRepository.save(cart)
  }
}
