import express from 'express'
import {
    subscribeToNewsletter,
    unsubscribeFromNewsletter,
    getAllSubscribers,
    getSubscriberStats
} from '../controllers/newsletterController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.post('/subscribe', subscribeToNewsletter)
router.post('/unsubscribe', unsubscribeFromNewsletter)

router.get('/subscribers', protect, adminOnly, getAllSubscribers)
router.get('/stats', protect, adminOnly, getSubscriberStats)

export default router 