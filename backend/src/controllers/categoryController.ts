import { Request, Response } from 'express'
import { Category } from '../models/Category'

export const getCategories = async (_: Request, res: Response) => {
    const categories = await Category.find().sort({ sortOrder: 1 })
    res.json(categories)
}

export const createCategory = async (req: Request, res: Response) => {
    const { name, description, image } = req.body
    const category = new Category({ name, description, image })
    await category.save()
    res.status(201).json(category)
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
