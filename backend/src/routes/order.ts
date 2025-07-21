import express from 'express'
import {
    placeOrder,
    getMyOrders,
    getOrder,
    markOrderAsPaid,
    updateOrderStatus,
    simulatePayment,
    getAllOrders,
} from '../controllers/orderController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.get('/all', protect, adminOnly, getAllOrders)
router.get('/me', protect, getMyOrders)

router.post('/', placeOrder)
router.get('/:id', getOrder)
router.post('/:id/pay', protect, simulatePayment)
router.put('/:id/status', protect, adminOnly, updateOrderStatus)

export default router
