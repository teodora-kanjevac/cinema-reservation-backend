import { Router } from 'express'
import { createCinema, editCinema, getCinemaById, getCinemas, removeCinema } from '../controllers/cinemaController'

const router: Router = Router()

router.delete('/:id', removeCinema)
router.post('/create', createCinema)
router.put('/edit/:id', editCinema)
router.get('/:id', getCinemaById)
router.get('/', getCinemas)

export default router
