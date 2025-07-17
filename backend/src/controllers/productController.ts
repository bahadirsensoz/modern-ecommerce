import { Request, Response } from 'express'
import { Product } from '../models/Product'

export const getProducts = async (_: Request, res: Response) => {
    const products = await Product.find().populate('category')
    res.json(products)
}

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params
    const product = await Product.findById(id).populate('category')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
}

export const createProduct = async (req: Request, res: Response) => {
    const {
        name,
        description,
        price,
        stock,
        images,
        category,
        variants,
        tags,
        isFeatured,
        specifications,
    } = req.body

    const product = new Product({
        name,
        description,
        price,
        stock,
        images,
        category,
        variants,
        tags,
        isFeatured,
        specifications,
    })

    await product.save()
    res.status(201).json(product)
}

export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
}

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params
    const product = await Product.findByIdAndDelete(id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ message: 'Product deleted' })
}
