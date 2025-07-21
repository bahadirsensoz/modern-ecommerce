import express from 'express'
import { getDashboardStats, getAllCustomers, getCustomerOrders } from '../controllers/adminController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.use(protect)
router.use(adminOnly)

router.get('/dashboard', getDashboardStats)
router.get('/customers', getAllCustomers)
router.get('/customers/:userId/orders', getCustomerOrders)

export default router 