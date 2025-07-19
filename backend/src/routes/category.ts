import express from 'express'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoryController'
import { protect } from '../middleware/authMiddleware'
import { adminOnly } from '../middleware/adminOnly'

const router = express.Router()

router.get('/', getCategories)
router.post('/', protect, adminOnly, createCategory)
router.put('/:id', protect, adminOnly, updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

export default router
