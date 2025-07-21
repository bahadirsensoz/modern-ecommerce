import { Request, Response } from 'express'
import { Product } from '../models/Product'
import { UserActivity } from '../models/UserActivity'
import { Category } from '../models/Category'

export const getRecommendations = async (req: Request, res: Response) => {
    try {
        const { userId, sessionId, productId, categoryId, limit = 8 } = req.query

        let recommendations: any[] = []

        // If viewing a specific product, get related products
        if (productId) {
            const product = await Product.findById(productId).populate('category')
            if (product && product.category) {
                recommendations = await Product.find({
                    _id: { $ne: productId },
                    category: product.category._id
                })
                    .populate('category')
                    .sort({ rating: -1 })
                    .limit(Number(limit))
                    .lean()
            }
        }
        // If browsing a category, get popular products from that category
        else if (categoryId) {
            recommendations = await Product.find({ category: categoryId })
                .populate('category')
                .sort({ rating: -1 })
                .limit(Number(limit))
                .lean()
        }
        // If user is logged in, get personalized recommendations
        else if (userId) {
            const recentActivity = await UserActivity.find({ user: userId })
                .populate('productId')
                .populate('categoryId')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()

            const interestedCategories = [...new Set(
                recentActivity
                    .filter(act => act.categoryId && act.categoryId._id)
                    .map(act => act.categoryId!._id)
            )]

            if (interestedCategories.length > 0) {
                recommendations = await Product.find({
                    category: { $in: interestedCategories }
                })
                    .populate('category')
                    .sort({ rating: -1 })
                    .limit(Number(limit))
                    .lean()
            }
        }
        // If session user, get recently viewed products
        else if (sessionId) {
            const recentViews = await UserActivity.find({
                sessionId,
                activityType: 'view'
            })
                .populate('productId')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()

            const viewedProductIds = [...new Set(
                recentViews
                    .filter(act => act.productId && act.productId._id)
                    .map(act => act.productId!._id)
            )]

            if (viewedProductIds.length > 0) {
                const viewedProducts = await Product.find({
                    _id: { $in: viewedProductIds }
                }).populate('category')

                const categories = [...new Set(
                    viewedProducts
                        .filter(p => p.category && p.category._id)
                        .map(p => p.category!._id)
                )]

                if (categories.length > 0) {
                    recommendations = await Product.find({
                        category: { $in: categories },
                        _id: { $nin: viewedProductIds }
                    })
                        .populate('category')
                        .sort({ rating: -1 })
                        .limit(Number(limit))
                        .lean()
                }
            }
        }

        if (recommendations.length === 0) {
            recommendations = await Product.find()
                .populate('category')
                .sort({ rating: -1 })
                .limit(Number(limit))
                .lean()
        }

        res.json(recommendations)
    } catch (error) {
        console.error('Recommendation error:', error)
        res.status(500).json({ message: 'Failed to get recommendations' })
    }
}

export const getPopularProducts = async (req: Request, res: Response) => {
    try {
        const { limit = 8 } = req.query

        const products = await Product.find()
            .populate('category')
            .sort({ rating: -1, 'reviews.length': -1 })
            .limit(Number(limit))
            .lean()

        res.json(products)
    } catch (error) {
        console.error('Popular products error:', error)
        res.status(500).json({ message: 'Failed to get popular products' })
    }
}

export const getRelatedProducts = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params
        const { limit = 4 } = req.query

        const product = await Product.findById(productId).populate('category')
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const relatedProducts = await Product.find({
            _id: { $ne: productId },
            category: product.category?._id
        })
            .populate('category')
            .sort({ rating: -1 })
            .limit(Number(limit))
            .lean()

        res.json(relatedProducts)
    } catch (error) {
        console.error('Related products error:', error)
        res.status(500).json({ message: 'Failed to get related products' })
    }
}

export const getRecentlyViewed = async (req: Request, res: Response) => {
    try {
        const { userId, sessionId } = req.query
        const { limit = 8 } = req.query

        const query: any = { activityType: 'view' }

        if (userId) {
            query.user = userId
        } else if (sessionId) {
            query.sessionId = sessionId
        } else {
            return res.json([])
        }

        const activities = await UserActivity.find(query)
            .populate('productId')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 2)

        const productIds = [...new Set(
            activities
                .filter(act => act.productId && act.productId._id)
                .map(act => act.productId!._id)
        )].slice(0, Number(limit))

        if (productIds.length === 0) {
            return res.json([])
        }

        const products = await Product.find({
            _id: { $in: productIds }
        })
            .populate('category')
            .lean()

        // Sort by the order of activities
        const sortedProducts = productIds
            .map(id => products.find(p => p._id.toString() === id.toString()))
            .filter(Boolean)

        res.json(sortedProducts)
    } catch (error) {
        console.error('Recently viewed error:', error)
        res.status(500).json({ message: 'Failed to get recently viewed products' })
    }
}

export const trackActivity = async (req: Request, res: Response) => {
    try {
        const { activityType, productId, categoryId, searchQuery, metadata } = req.body
        const userId = (req as any).user?._id
        const sessionId = req.headers['x-session-id'] as string || req.cookies.sessionId

        if (!userId && !sessionId) {
            return res.status(400).json({ message: 'User or session ID required' })
        }

        await UserActivity.create({
            user: userId,
            sessionId: !userId ? sessionId : undefined,
            activityType,
            productId,
            categoryId,
            searchQuery,
            metadata
        })

        res.json({ message: 'Activity tracked successfully' })
    } catch (error) {
        console.error('Track activity error:', error)
        res.status(500).json({ message: 'Failed to track activity' })
    }
} 