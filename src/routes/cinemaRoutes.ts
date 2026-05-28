import { Router } from 'express'
import { createCinema, editCinema, getCinemaById, getCinemas, removeCinema } from '../controllers/cinemaController'
import { authenticateToken } from '../middleware/auth'

const router: Router = Router()

router.use(authenticateToken)

router.delete('/:id', removeCinema)
router.post('/create', createCinema)
router.put('/edit/:id', editCinema)
router.get('/:id', getCinemaById)
router.get('/', getCinemas)

export default router
