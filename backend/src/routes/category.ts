import express from 'express'
import { upload } from '../middleware/uploadMiddleware'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController'

const router = express.Router()

router.get('/', getCategories)
router.post('/', protect, adminOnly, upload.single('image'), createCategory)
router.put('/:id', protect, adminOnly, upload.single('image'), updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

export default router
