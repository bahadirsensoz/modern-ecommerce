import { Request, Response } from 'express'
import { User, IUser } from '../models/User'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import validator from 'validator'

interface AuthRequest extends Request {
    user?: IUser
}

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id
        let { firstName, lastName, phone } = req.body
        if (firstName) firstName = validator.escape(firstName)
        if (lastName) lastName = validator.escape(lastName)
        if (phone) phone = validator.escape(phone)

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        if (firstName !== undefined) user.firstName = firstName
        if (lastName !== undefined) user.lastName = lastName
        if (phone !== undefined) user.phone = phone

        await user.save()

        res.json({ message: 'Profile updated', user })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both fields are required' })
        }
        if (typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' })
        }

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) return res.status(403).json({ message: 'Current password is incorrect' })

        const hashed = await bcrypt.hash(newPassword, 10)
        user.password = hashed
        await user.save()

        res.json({ message: 'Password changed successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

interface Address {
    label?: string
    street?: string
    city?: string
    country?: string
    postalCode?: string
    isDefault: boolean
}

export const updateAddresses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id
        const { addresses } = req.body as { addresses: Address[] }

        if (!Array.isArray(addresses)) {
            return res.status(400).json({ message: 'Addresses must be an array' })
        }

        const hasNewDefault = addresses.some(addr => addr.isDefault)
        if (hasNewDefault) {
            addresses.forEach((addr, index) => {
                if (index !== addresses.findIndex(a => a.isDefault)) {
                    addr.isDefault = false
                }
            })
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { addresses },
            { new: true }
        )

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.json(user.addresses)
    } catch (error) {
        console.error('Update addresses error:', error)
        res.status(500).json({ message: 'Failed to update addresses' })
    }
}

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?._id
        const { productId } = req.body as { productId: string }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' })
        }

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        const objectId = new mongoose.Types.ObjectId(productId)
        const index = user.favorites.findIndex((fav) => fav.equals(objectId))

        if (index > -1) {
            user.favorites.splice(index, 1)
        } else {
            user.favorites.push(objectId)
        }

        await user.save()

        res.status(200).json({
            message: index > -1 ? 'Removed from favorites' : 'Added to favorites',
            favorites: user.favorites
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

export const getFavorites = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id || req.user?._id
        const user = await User.findById(userId).populate('favorites')
        if (!user) return res.status(404).json({ message: 'User not found' })

        res.json(user.favorites)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}
