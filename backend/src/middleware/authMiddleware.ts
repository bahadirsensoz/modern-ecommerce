import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized' })
    }

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }

        const user = await User.findById(decoded.id).select('-password')
        if (!user) return res.status(401).json({ message: 'User not found' })

        req.user = user
        next()
    } catch (err) {
        res.status(401).json({ message: 'Token invalid' })
    }
}
