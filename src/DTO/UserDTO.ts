import type { InvoiceDTO } from './InvoiceDTO'

export interface UserDTO {
  id: number
  firstName: string
  lastName: string
  gender: 'm' | 'f'
  email: string
  createdAt: Date
  verifiedAt?: Date
  invoices?: InvoiceDTO[]
}

export interface UserStatsDTO {
  userId: number
  moviesWatched: number
  totalMoneySpent: number
  wishlistItemCount: number
}
