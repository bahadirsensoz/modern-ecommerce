import express from 'express'
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    deleteProductReview,
} from '../controllers/productController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, adminOnly, createProduct)
router.put('/:id', protect, adminOnly, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)
router.post('/:id/reviews', protect, addProductReview)
router.delete('/:id/reviews', protect, deleteProductReview)

export default router
