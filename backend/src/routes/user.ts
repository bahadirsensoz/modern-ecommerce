import express from 'express'
import { getMe } from '../controllers/userController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/me', protect, getMe)

export default router
