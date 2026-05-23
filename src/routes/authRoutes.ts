import { Router } from 'express'
import { login, logout, refresh, register, resendCode, verifyCode } from '../controllers/authController'

const router: Router = Router()

router.post('/refresh', refresh)
router.post('/register', register)
router.post('/verify', verifyCode)
router.post('/resend-code', resendCode)
router.post('/logout', logout)
router.post('/login', login)

export default router
