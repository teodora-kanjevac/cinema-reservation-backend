import express, { type Application } from 'express'
import morgan from 'morgan'
import cors from 'cors'

const app: Application = express()
const PORT = 3000

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Cinema Reservation API is running!')
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
