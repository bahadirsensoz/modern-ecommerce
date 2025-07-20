import { Request, Response } from 'express'
import { Product } from '../models/Product'
import { IUser } from '../models/User'
import multer from 'multer'
import cloudinary from '../config/cloudinary'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
            files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
        }
    }
}

export const getProducts = async (_: Request, res: Response) => {
    const products = await Product.find().populate('category')
    res.json(products)
}

export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params
    const product = await Product.findById(id)
        .populate('category')
        .populate('reviews.user', 'firstName lastName')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
}

// Add image upload handling to createProduct

export const createProduct = async (req: Request, res: Response) => {
    try {
        const imageUrls = []

        if (req.files) {
            const files = req.files as Express.Multer.File[]
            for (const file of files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'products',
                })
                imageUrls.push(result.secure_url)
            }
        }

        const product = new Product({
            ...req.body,
            images: imageUrls,
        })

        await product.save()
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ message: 'Failed to create product' })
    }
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

export const addProductReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const { rating, comment } = req.body
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const existingReview = product.reviews.find(
            (review: any) => review.user.toString() === userId.toString()
        )

        if (existingReview) {
            existingReview.rating = rating
            existingReview.comment = comment
            existingReview.createdAt = new Date()
        } else {
            product.reviews.push({
                user: userId,
                rating,
                comment,
            })
        }

        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

        await product.save()

        const updatedProduct = await Product.findById(id)
            .populate('reviews.user', 'firstName lastName')
            .populate('category')

        res.status(200).json(updatedProduct)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        res.status(400).json({ message: errorMessage })
    }
}

export const deleteProductReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.user?._id

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' })
        }

        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const reviewsToKeep = product.reviews.filter(
            (review: any) => review.user.toString() !== userId.toString()
        )
        product.reviews.splice(0, product.reviews.length)
        reviewsToKeep.forEach(review => product.reviews.push(review))

        if (product.reviews.length > 0) {
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
        } else {
            product.rating = 0
        }

        await product.save()

        const updatedProduct = await Product.findById(id)
            .populate('reviews.user', 'firstName lastName')
            .populate('category')

        res.status(200).json(updatedProduct)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        res.status(400).json({ message: errorMessage })
    }
}
