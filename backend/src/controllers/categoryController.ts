import { Request, Response } from 'express'
import { Category } from '../models/Category'
import { v2 as cloudinary } from 'cloudinary'

export const getCategories = async (_: Request, res: Response) => {
    const categories = await Category.find().sort({ sortOrder: 1 })
    res.json(categories)
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        let imageUrl = ''

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'categories'
            })
            imageUrl = result.secure_url
        }

        const category = new Category({
            ...req.body,
            image: imageUrl
        })

        await category.save()
        res.status(201).json(category)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create category' })
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
