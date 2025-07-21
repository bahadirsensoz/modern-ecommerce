import express from 'express'
import { getDashboardStats } from '../controllers/adminController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.use(protect)
router.use(adminOnly)

router.get('/dashboard', getDashboardStats)

export default router 