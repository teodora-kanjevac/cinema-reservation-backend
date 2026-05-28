import express, { type Application } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import movieRoutes from '../src/routes/movieRoutes'
import cinemaRoutes from '../src/routes/cinemaRoutes'
import timeTableRoutes from '../src/routes/timeTableRoutes'
import invoiceRoutes from '../src/routes/invoiceRoutes'
import authRoutes from '../src/routes/authRoutes'
import userRoutes from '../src/routes/userRoutes'
import wishlistRoutes from '../src/routes/wishlistRoutes'
import { dataSource } from './config/db'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()
const PORT = 3001

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

app.use('/api/movies', movieRoutes)
app.use('/api/cinemas', cinemaRoutes)
app.use('/api/time-tables', timeTableRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/wishlists', wishlistRoutes)

app.use(errorHandler)

dataSource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
