import { Request, Response } from 'express'
import { Product } from '../models/Product'
import { IUser } from '../models/User'
import multer from 'multer'
import cloudinary, { uploadImage } from '../config/cloudinary'

declare global {
    namespace Express {
        interface Request {
            user?: IUser
            files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[]
        }
    }
}

// Modify getProducts to exclude unapproved reviews
export const getProducts = async (_: Request, res: Response) => {
    const products = await Product.find()
        .populate('category')
        .lean() // Convert to plain JS object for manipulation

    // Filter out unapproved reviews and recalculate ratings
    const sanitizedProducts = products.map(product => {
        const approvedReviews = product.reviews?.filter(r => r.isApproved) || []
        const rating = approvedReviews.length > 0
            ? approvedReviews.reduce((acc: number, review: any) => acc + review.rating, 0) / approvedReviews.length
            : 0

        return {
            ...product,
            reviews: approvedReviews,
            rating
        }
    })

    res.json(sanitizedProducts)
}

// Modify getProductById to exclude unapproved reviews
export const getProductById = async (req: Request, res: Response) => {
    const { id } = req.params
    const product = await Product.findById(id)
        .populate('category')
        .populate('reviews.user', 'firstName lastName')
        .lean() // Convert to plain JS object for manipulation

    if (!product) return res.status(404).json({ message: 'Product not found' })

    // Filter out unapproved reviews and recalculate rating
    const approvedReviews = product.reviews?.filter(r => r.isApproved) || []
    const rating = approvedReviews.length > 0
        ? approvedReviews.reduce((acc: number, review: any) => acc + review.rating, 0) / approvedReviews.length
        : 0

    // Send sanitized product data
    const sanitizedProduct = {
        ...product,
        reviews: approvedReviews,
        rating
    }

    res.json(sanitizedProduct)
}

export const createProduct = async (req: Request, res: Response) => {
    try {
        if (!req.body?.name || !req.body?.price) {
            return res.status(400).json({
                message: 'Name and price are required fields'
            })
        }

        const imageUrls: string[] = []

        if (req.files && Array.isArray(req.files)) {
            for (const file of req.files) {
                try {
                    const imageUrl = await uploadImage(file)
                    imageUrls.push(imageUrl)
                } catch (uploadError) {
                    console.error('❌ Image upload failed:', uploadError)
                }
            }
        }

        const product = new Product({
            name: req.body.name,
            description: req.body.description || '',
            price: Number(req.body.price),
            category: req.body.category,
            images: imageUrls
        })

        await product.save()

        res.status(201).json(product)
    } catch (error: any) {
        console.error('❌ Create product error:', error)
        res.status(500).json({
            message: 'Failed to create product',
            error: error.message
        })
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

// Modify addProductReview to only return approved reviews
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
            existingReview.isApproved = false // Reset approval on edit
        } else {
            product.reviews.push({
                user: userId,
                rating,
                comment,
                isApproved: false // New reviews start unapproved
            })
        }

        // Only calculate rating from approved reviews
        const approvedReviews = product.reviews.filter(r => r.isApproved)
        product.rating = approvedReviews.length > 0
            ? approvedReviews.reduce((acc: number, review: any) => acc + review.rating, 0) / approvedReviews.length
            : 0

        await product.save()

        // Get updated product and sanitize before sending
        const updatedProduct = await Product.findById(id)
            .populate('reviews.user', 'firstName lastName')
            .populate('category')
            .lean()

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const sanitizedProduct = {
            ...updatedProduct,
            reviews: updatedProduct.reviews.filter(r =>
                r.isApproved || (r.user as any)._id.toString() === userId.toString()
            )
        }

        res.status(200).json(sanitizedProduct)
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

export const approveReview = async (req: Request, res: Response) => {
    try {
        const { productId, reviewId } = req.params

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const review = product.reviews.id(reviewId)
        if (!review) {
            return res.status(404).json({ message: 'Review not found' })
        }

        review.isApproved = true

        const approvedReviews = product.reviews.filter(r => r.isApproved)
        product.rating = approvedReviews.length > 0
            ? approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length
            : 0

        await product.save()

        const updatedProduct = await Product.findById(productId)
            .populate('reviews.user', 'firstName lastName')
            .populate('category')

        res.status(200).json(updatedProduct)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        res.status(400).json({ message: errorMessage })
    }
}

// Add new controller method for getting pending reviews
export const getPendingReviews = async (_: Request, res: Response) => {
    try {
        const products = await Product.find({ 'reviews.isApproved': false })
            .populate('category')
            .populate('reviews.user', 'firstName lastName')
            .lean()

        // Only include products that have pending reviews
        const productsWithPendingReviews = products.map(product => ({
            ...product,
            reviews: product.reviews.filter(r => !r.isApproved)
        })).filter(product => product.reviews.length > 0)

        res.json(productsWithPendingReviews)
    } catch (error) {
        console.error('Failed to fetch pending reviews:', error)
        res.status(500).json({ message: 'Failed to fetch pending reviews' })
    }
}
