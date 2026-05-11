import dotenv from 'dotenv'
import { DataSource } from 'typeorm'
import { Cinema } from '../models/Cinema'
import { TimeTable } from '../models/TimeTable'
import { InvoiceItem } from '../models/InvoiceItem'
import { Invoice } from '../models/Invoice'
import { User } from '../models/User'

dotenv.config()

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3309,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'root',
  database: process.env.DB_NAME || 'cinema-reservation',
  entities: [User, Cinema, TimeTable, InvoiceItem, Invoice],
})
