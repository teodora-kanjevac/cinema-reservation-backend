import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController'

const router: Router = Router()

router.use(authenticateToken)

router.delete('/:movieId', removeFromWishlist)
router.post('/add', addToWishlist)
router.get('/', getWishlist)

export default router
