import { Request, Response } from 'express'
import { Category } from '../models/Category'
import cloudinary, { uploadImage } from '../config/cloudinary'

export const getCategories = async (_: Request, res: Response) => {
    const categories = await Category.find().sort({ sortOrder: 1 })
    res.json(categories)
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        if (!req.body?.name) {
            return res.status(400).json({
                message: 'Name is required'
            })
        }

        let imageUrl = ''

        if (req.file) {
            try {
                imageUrl = await uploadImage(req.file)
            } catch (uploadError) {
                console.error('❌ Image upload failed:', uploadError)
            }
        }

        const category = new Category({
            name: req.body.name,
            description: req.body.description || '',
            image: imageUrl
        })

        await category.save()

        res.status(201).json(category)
    } catch (error: any) {
        console.error('❌ Create category error:', error)
        res.status(500).json({
            message: 'Failed to create category',
            error: error.message
        })
    }
}

export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params
    const update = req.body
    const category = await Category.findByIdAndUpdate(id, update, { new: true })
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json(category)
}

export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params
    const category = await Category.findByIdAndDelete(id)
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json({ message: 'Category deleted' })
}
