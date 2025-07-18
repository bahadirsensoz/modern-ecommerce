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

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)
router.post('/:id/reviews', protect, addProductReview)
router.delete('/:id/reviews', protect, deleteProductReview)

export default router
