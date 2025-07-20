import express from 'express'
import {
    placeOrder,
    getMyOrders,
    getOrder,
    markOrderAsPaid,
    updateOrderStatus,
    simulatePayment,
} from '../controllers/orderController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/', protect, placeOrder)

router.get('/me', protect, getMyOrders)

router.get('/:id', protect, getOrder)

router.post('/:id/pay', protect, simulatePayment)

router.put('/:id/status', protect, updateOrderStatus)

export default router
