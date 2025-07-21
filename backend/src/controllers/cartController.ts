import { Request, Response } from 'express'
import { Cart, ICartItem } from '../models/Cart'
import jwt from 'jsonwebtoken'

const getUserIdFromRequest = (req: Request): string | null => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
            return decoded.id
        }

        const sessionId = req.headers['x-session-id'] as string
        if (sessionId) {
            return sessionId
        }

        const guestToken = req.cookies.guestToken || null
        return guestToken
    } catch (error) {
        console.error('Error in getUserIdFromRequest:', error)
        const sessionId = req.headers['x-session-id'] as string
        if (sessionId) {
            return sessionId
        }
        const guestToken = req.cookies.guestToken || null
        return guestToken
    }
}

export const getCart = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req)
        if (!userId) return res.json({ items: [] })

        const isSessionId = userId.startsWith('session_')

        let cart
        if (isSessionId) {
            cart = await Cart.findOne({ sessionId: userId }).populate('items.product')
        } else {
            cart = await Cart.findOne({ user: userId }).populate('items.product')
        }

        res.json(cart || { items: [] })
    } catch (error) {
        console.error('GET CART ERROR:', error)
        res.status(500).json({ message: 'Failed to get cart' })
    }
}

export const addToCart = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req)

        if (!userId) return res.status(400).json({ message: 'No user or session ID found' })

        const { productId, quantity, size, color } = req.body
        if (!productId || !quantity) {
            return res.status(400).json({ message: 'Product ID and quantity are required' })
        }

        const isSessionId = userId.startsWith('session_')

        let cart
        if (isSessionId) {
            cart = await Cart.findOne({ sessionId: userId })
            if (!cart) {
                cart = new Cart({ sessionId: userId, items: [] })
            }
        } else {
            cart = await Cart.findOne({ user: userId })
            if (!cart) {
                cart = new Cart({ user: userId, items: [] })
            }
        }

        const existingIndex = cart.items.findIndex((item: ICartItem) =>
            item.product.toString() === productId &&
            (item.size || '') === (size || '') &&
            (item.color || '') === (color || '')
        )

        if (existingIndex !== -1) {
            cart.items[existingIndex].quantity += quantity
        } else {
            cart.items.push({ product: productId, quantity, size, color })
        }

        await cart.save()
        const populatedCart = await Cart.findById(cart._id).populate('items.product')
        res.json(populatedCart)
    } catch (error) {
        console.error('ADD TO CART ERROR:', error)
        res.status(500).json({ message: 'Failed to add to cart' })
    }
}

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req)
        const { productId, quantity } = req.body
        if (!userId) return res.status(400).json({ message: 'No user or session ID found' })

        const isSessionId = userId.startsWith('session_')

        let cart
        if (isSessionId) {
            cart = await Cart.findOne({ sessionId: userId })
        } else {
            cart = await Cart.findOne({ user: userId })
        }

        if (!cart) return res.status(404).json({ message: 'Cart not found' })

        const item = cart.items.find((item: ICartItem) => item.product.toString() === productId)
        if (!item) return res.status(404).json({ message: 'Item not found in cart' })

        item.quantity = quantity
        await cart.save()

        const populatedCart = await Cart.findById(cart._id).populate('items.product')
        res.json(populatedCart)
    } catch (error) {
        console.error('UPDATE CART ERROR:', error)
        res.status(500).json({ message: 'Failed to update cart' })
    }
}

export const removeFromCart = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req)
        const { productId } = req.body
        if (!userId) return res.status(400).json({ message: 'No user or session ID found' })

        const isSessionId = userId.startsWith('session_')

        let cart
        if (isSessionId) {
            cart = await Cart.findOne({ sessionId: userId })
        } else {
            cart = await Cart.findOne({ user: userId })
        }

        if (!cart) return res.status(404).json({ message: 'Cart not found' })

        cart.items = cart.items.filter(item => item.product.toString() !== productId)

        if (cart.items.length === 0) {
            await Cart.findByIdAndDelete(cart._id)
            return res.json({ message: 'Cart deleted', items: [] })
        } else {
            await cart.save()
            const populatedCart = await Cart.findById(cart._id).populate('items.product')
            res.json(populatedCart)
        }
    } catch (error) {
        console.error('REMOVE FROM CART ERROR:', error)
        res.status(500).json({ message: 'Failed to remove from cart' })
    }
}

export const clearCart = async (req: Request, res: Response) => {
    try {
        const userId = getUserIdFromRequest(req)
        if (!userId) {
            return res.status(400).json({ message: 'No user or session ID found' })
        }

        const isSessionId = userId.startsWith('session_')

        let deletedCart
        if (isSessionId) {
            deletedCart = await Cart.findOneAndDelete({ sessionId: userId })
        } else {
            deletedCart = await Cart.findOneAndDelete({ user: userId })
        }

        res.json({ message: 'Cart cleared successfully' })
    } catch (error) {
        console.error('CLEAR CART ERROR:', error)
        res.status(500).json({ message: 'Failed to clear cart' })
    }
}
