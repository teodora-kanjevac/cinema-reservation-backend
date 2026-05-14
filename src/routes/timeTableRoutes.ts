import { Router } from 'express'
import {
  createTimeTable,
  editTimeTable,
  getAvailableMovies,
  getTimeTableById,
  removeTimeTable,
} from '../controllers/timeTableController'

const router: Router = Router()

router.delete('/:id', removeTimeTable)
router.post('/create', createTimeTable)
router.put('/edit/:id', editTimeTable)
router.get('/:id', getTimeTableById)
router.get('/', getAvailableMovies)

export default router
