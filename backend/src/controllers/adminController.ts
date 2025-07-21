import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { Product } from '../models/Product'

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        // Get total sales
        const totalSalesResult = await Order.aggregate([
            { $match: { status: { $ne: 'cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ])
        const totalSales = totalSalesResult[0]?.total || 0

        // Get total orders
        const totalOrders = await Order.countDocuments()

        // Get total customers
        const totalCustomers = await User.countDocuments({ role: 'customer' })

        // Get total products
        const totalProducts = await Product.countDocuments()

        // Get recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()

        // Get popular products
        const popularProducts = await Product.find()
            .populate('category')
            .sort({ rating: -1, 'reviews.length': -1 })
            .limit(10)
            .lean()

        // Get order status distribution
        const orderStatusDistribution = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ])

        const statusDistribution = {
            pending: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0
        }

        orderStatusDistribution.forEach(item => {
            if (item._id in statusDistribution) {
                statusDistribution[item._id as keyof typeof statusDistribution] = item.count
            }
        })

        // Get monthly sales for the last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $ne: 'cancelled' }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    sales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ])

        const monthlySalesFormatted = monthlySales.map(item => ({
            month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
            sales: item.sales
        }))

        res.json({
            totalSales,
            totalOrders,
            totalCustomers,
            totalProducts,
            recentOrders,
            popularProducts,
            orderStatusDistribution: statusDistribution,
            monthlySales: monthlySalesFormatted
        })
    } catch (error) {
        console.error('Dashboard stats error:', error)
        res.status(500).json({ message: 'Failed to get dashboard statistics' })
    }
} 