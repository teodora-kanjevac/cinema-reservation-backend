import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'
import { changePassword, editUser, getUserInfo, getUserStats } from '../controllers/userController'

const router: Router = Router()

router.use(authenticateToken)

router.put('/password', changePassword)
router.put('/info', editUser)
router.get('/stats', getUserStats)
router.get('/info', getUserInfo)

export default router
