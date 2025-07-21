import express from 'express'
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.post('/remove', removeFromCart)

router.post('/clear', protect, clearCart)

export default router
