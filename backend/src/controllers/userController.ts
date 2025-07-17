import { Request, Response } from 'express'
import { User } from '../models/User'

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
