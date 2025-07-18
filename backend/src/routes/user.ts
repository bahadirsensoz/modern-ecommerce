import express from 'express'
import { getMe, changePassword, updateProfile, updateAddresses } from '../controllers/userController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/me', protect, getMe)
router.put('/change-password', protect, changePassword)
router.put('/me', protect, updateProfile)
router.put('/me/addresses', protect, updateAddresses)

export default router
