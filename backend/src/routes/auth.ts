import express from 'express'
import {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword,
} from '../controllers/authController'
import { authLimiter, resetRateLimits } from '../middleware/rateLimit'

const router = express.Router()

router.post('/register', authLimiter, registerUser)
router.post('/login', authLimiter, loginUser)
router.get('/verify-email', verifyEmail)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

export default router
