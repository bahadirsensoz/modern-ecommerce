import express from 'express'
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductReview,
    deleteProductReview,
    approveReview,
    getPendingReviews,
} from '../controllers/productController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'
import { upload } from '../middleware/uploadMiddleware'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', protect, adminOnly, upload.array('images', 5), createProduct)
router.put('/:id', protect, adminOnly, upload.array('images', 5), updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)
router.post('/:id/reviews', protect, addProductReview)
router.delete('/:id/reviews', protect, deleteProductReview)
router.put('/:productId/reviews/:reviewId/approve', protect, adminOnly, approveReview)
router.get('/reviews/pending', protect, adminOnly, getPendingReviews)


export default router
