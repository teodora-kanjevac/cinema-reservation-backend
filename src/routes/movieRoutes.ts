import { Router } from 'express'
import { getMovieById, getMovieDetails, getMovies, getMoviesById } from '../controllers/movieController'

const router: Router = Router()

router.post('/select', getMoviesById)
router.get('/details/:id', getMovieDetails)
router.get('/:id', getMovieById)
router.get('/', getMovies)

export default router
