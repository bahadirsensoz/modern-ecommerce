import { Request, Response } from 'express'
import { Order } from '../models/Order'
import { Cart } from '../models/Cart'
import { User } from '../models/User'
import { Product } from '../models/Product'

export const placeOrder = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id
        const sessionId = req.cookies.sessionId
        const { shippingAddress, paymentMethod, email, items, priceDetails } = req.body

        console.log('Place order auth:', { userId, sessionId, hasToken: !!req.headers.authorization })

        if (!items?.length) {
            return res.status(400).json({ message: 'No items provided' })
        }

        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' })
        }

        let fullName = shippingAddress.fullName
        let orderUser = null

        if (userId) {
            const user = await User.findById(userId)
            if (user) {
                orderUser = userId
                fullName = `${user.firstName} ${user.lastName}`.trim()
            }
        }

        const populatedItems = await Promise.all(items.map(async (item: any) => {
            const product = await Product.findById(item.product)
            if (!product) {
                throw new Error(`Product not found: ${item.product}`)
            }
            return {
                ...item,
                price: product.price
            }
        }))

        const subtotal = populatedItems.reduce((acc, item) => {
            return acc + (item.price * item.quantity)
        }, 0)

        const TAX_RATE = 0.18
        const SHIPPING_COST = 50

        const tax = subtotal * TAX_RATE
        const shipping = SHIPPING_COST
        const totalPrice = subtotal + tax + shipping

        const orderData = {
            orderItems: items,
            shippingAddress: {
                ...shippingAddress,
                fullName
            },
            paymentMethod,
            subtotal,
            tax,
            shipping,
            totalPrice,
            isPaid: false,
            status: 'pending',
            email,
            ...(orderUser ? { user: orderUser } : { sessionId })
        }

        const order = new Order(orderData)
        await order.save()

        console.log('Order created:', {
            orderId: order._id,
            userId: order.user,
            sessionId: order.sessionId,
            isAuthenticated: !!orderUser
        })

        const cartQuery = orderUser ? { user: orderUser } : { sessionId }
        await Cart.findOneAndDelete(cartQuery)

        const populatedOrder = await Order.findById(order._id).populate({
            path: 'orderItems.product',
            select: 'name price image description'
        })

        res.status(201).json(populatedOrder)
    } catch (error) {
        console.error('Place order error:', error)
        res.status(500).json({
            message: error instanceof Error ? error.message : 'Failed to place order'
        })
    }
}

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id
        const sessionId = req.cookies.sessionId

        if (!userId && !sessionId) {
            return res.status(401).json({ message: 'Authentication required' })
        }

        let query = {}
        if (userId) {
            query = { user: userId }
        } else {
            query = { sessionId: sessionId }
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: 'orderItems.product',
                select: 'name price image description'
            })

        console.log(`Found ${orders.length} orders for ${userId ? 'user' : 'guest'}:`, userId || sessionId)

        res.json(orders)
    } catch (error) {
        console.error('GET MY ORDERS ERROR:', error)
        res.status(500).json({
            message: 'Failed to fetch orders',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const getOrder = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id
        const userId = (req as any).user?._id
        const sessionId = req.cookies.sessionId

        const order = await Order.findOne({
            _id: orderId,
            $or: [
                { user: userId },
                { sessionId: sessionId }
            ]
        }).populate({
            path: 'orderItems.product',
            select: 'name price image description'
        })

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        console.log('Order found with items:', order.orderItems)
        res.json(order)
    } catch (error) {
        console.error('GET ORDER ERROR:', error)
        res.status(500).json({
            message: 'Failed to get order',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const markOrderAsPaid = async (req: Request, res: Response) => {
    const { id } = req.params
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    order.isPaid = true
    order.paidAt = new Date()
    await order.save()

    res.json({ message: 'Order marked as paid', order })
}

export const updateOrderStatus = async (req: Request, res: Response) => {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' })
    }

    const order = await Order.findById(id)
    if (!order) {
        return res.status(404).json({ message: 'Order not found' })
    }

    order.status = status
    await order.save()

    res.status(200).json(order)
}

export const simulatePayment = async (req: Request, res: Response) => {
    try {
        const orderId = req.params.id
        console.log('Processing payment for order:', orderId)

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        if (order.isPaid) {
            return res.status(400).json({ message: 'Order is already paid' })
        }

        if (!order.subtotal || !order.tax || !order.shipping) {
            const subtotal = order.orderItems.reduce((acc, item: any) => {
                return acc + (item.price * item.quantity)
            }, 0)

            order.subtotal = subtotal
            order.tax = subtotal * 0.18
            order.shipping = 50
            order.totalPrice = order.subtotal + order.tax + order.shipping
        }

        const userId = order.user
        const sessionId = order.sessionId

        console.log('Attempting to delete cart for:', { userId, sessionId })

        const cartQuery = {
            $or: [
                { user: userId },
                { sessionId: sessionId }
            ]
        }

        const deletedCart = await Cart.findOneAndDelete(cartQuery)
        console.log('Cart deletion result:', deletedCart?._id || 'No cart found')

        await new Promise(resolve => setTimeout(resolve, 1000))

        order.isPaid = true
        order.paidAt = new Date()
        order.status = 'processing'
        await order.save()

        const updatedOrder = await Order.findById(orderId)
            .populate('orderItems.product')

        console.log('Payment processed successfully, cart cleared')

        const cartCheck = await Cart.findOne(cartQuery)
        if (cartCheck) {
            console.error('Cart still exists after deletion attempt')
            await Cart.findOneAndDelete(cartQuery) // Try delete again
        }

        res.json({
            message: 'Payment successful',
            order: updatedOrder
        })
    } catch (error) {
        console.error('PAYMENT ERROR:', error)
        res.status(500).json({
            message: 'Payment processing failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}