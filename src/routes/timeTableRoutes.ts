import { Router } from 'express'
import {
  createTimeTable,
  editTimeTable,
  getAvailableMovies,
  getScreeningsForMovie,
  getSeatMap,
  getTimeTableById,
  getTimeTables,
  removeTimeTable,
} from '../controllers/timeTableController'
import { authenticateToken } from '../middleware/auth'

const router: Router = Router()

router.get('/movie/:movieId/screenings', getScreeningsForMovie)
router.get('/available', getAvailableMovies)
router.get('/:id/seats', getSeatMap)
router.get('/:id', getTimeTableById)
router.get('/', getTimeTables)

router.use(authenticateToken)

router.delete('/:id', removeTimeTable)
router.post('/create', createTimeTable)
router.put('/edit/:id', editTimeTable)

export default router
