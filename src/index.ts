import express, { type Application } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { dataSource } from './config/db'

const app: Application = express()
const PORT = 3000

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Cinema Reservation API is running!')
})

dataSource.initialize().then(() => {
  console.log('Connected to database')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
