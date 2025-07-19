import { Request, Response } from 'express'
import { User } from '../models/User'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req.user as any)?._id).select('-password')
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}


export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId
        const { firstName, lastName, phone } = req.body

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

export const changePassword = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both fields are required' })
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

export const updateAddresses = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId
        const { addresses } = req.body

        if (!Array.isArray(addresses)) {
            return res.status(400).json({ message: 'Invalid addresses format' })
        }

        for (const address of addresses) {
            if (
                typeof address.label !== 'string' ||
                typeof address.street !== 'string' ||
                typeof address.city !== 'string' ||
                typeof address.country !== 'string' ||
                typeof address.postalCode !== 'string' ||
                (address.isDefault !== undefined && typeof address.isDefault !== 'boolean')
            ) {
                return res.status(400).json({ message: 'Each address must have valid fields' })
            }
        }

        const defaultCount = addresses.filter(a => a.isDefault).length
        if (defaultCount > 1) {
            return res.status(400).json({ message: 'Only one address can be default' })
        }

        if (defaultCount === 0 && addresses.length > 0) {
            addresses[0].isDefault = true
        }

        const user = await User.findById(userId)
        if (!user) return res.status(404).json({ message: 'User not found' })

        user.set('addresses', addresses)
        await user.save()

        res.json({
            message: 'Addresses updated successfully',
            addresses: user.addresses,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

export const toggleFavorite = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?._id
        const { productId } = req.body

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

export const getFavorites = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id
        const user = await User.findById(userId).populate('favorites')
        if (!user) return res.status(404).json({ message: 'User not found' })

        res.json(user.favorites)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error' })
    }
}

