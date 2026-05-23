export interface InvoiceDTO {
  id: number
  userId: number
  pursId?: string
  pursTime?: Date
  pursCounter: string
  createdAt: Date
  invoiceItems?: InvoiceItemDTO[]
}

export interface InvoiceItemDTO {
  id: number
  invoiceId: number
  timeTableId: number
  pricePerItem: number
  count: number
  createdAt: Date
  updatedAt?: Date
}
