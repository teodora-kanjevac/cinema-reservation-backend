import { Router } from 'express'
import {
  addItemsToCart,
  checkoutCart,
  downloadInvoiceReceipt,
  getItemCountInCart,
  getOrCreateCart,
  getUserBookings,
  removeAllItemsFromCart,
  removeItemFromCart,
} from '../controllers/invoiceController'
import { authenticateToken } from '../middleware/auth'

const router: Router = Router()

router.use(authenticateToken)

router.delete('/cart/remove/all', removeAllItemsFromCart)
router.delete('/cart/remove/:id', removeItemFromCart)
router.post('/checkout', checkoutCart)
router.post('/cart/add', addItemsToCart)
router.get('/cart/count', getItemCountInCart)
router.get('/:invoiceId/download', downloadInvoiceReceipt)
router.get('/cart', getOrCreateCart)
router.get('/bookings', getUserBookings)

export default router
