import { Request, Response } from 'express'
import { User } from '../models/User'
import bcrypt from 'bcrypt'

export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).userId).select('-password')
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