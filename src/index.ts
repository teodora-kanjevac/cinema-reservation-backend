import express, { type Application } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import movieRoutes from '../src/routes/movieRoutes'
import cinemaRoutes from '../src/routes/cinemaRoutes'
import timeTableRoutes from '../src/routes/timeTableRoutes'
import { dataSource } from './config/db'
import { errorHandler } from './middleware/errorHandler'

const app: Application = express()
const PORT = 3001

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/movie', movieRoutes)
app.use('/api/cinema', cinemaRoutes)
app.use('/api/time-table', timeTableRoutes)

app.use(errorHandler)

dataSource.initialize().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
