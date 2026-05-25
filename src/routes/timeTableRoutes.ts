import { Router } from 'express'
import {
  createTimeTable,
  editTimeTable,
  getAvailableMovies,
  getScreeningsForMovie,
  getSeatMap,
  getTimeTableById,
  removeTimeTable,
} from '../controllers/timeTableController'

const router: Router = Router()

router.delete('/:id', removeTimeTable)
router.post('/create', createTimeTable)
router.put('/edit/:id', editTimeTable)
router.get('/movie/:movieId/screenings', getScreeningsForMovie)
router.get('/:id/seats', getSeatMap)
router.get('/:id', getTimeTableById)
router.get('/', getAvailableMovies)

export default router
