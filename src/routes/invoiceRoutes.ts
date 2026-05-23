import { Router } from 'express'
import { addItemToCart, checkoutCart, getOrCreateCart, removeItemFromCart } from '../controllers/invoiceController'
import { authenticateToken } from '../middleware/auth'

const router: Router = Router()

router.use(authenticateToken)

router.delete('/cart/remove/:id', removeItemFromCart)
router.post('/cart/checkout', checkoutCart)
router.post('/cart/add', addItemToCart)
router.get('/cart', getOrCreateCart)

export default router
