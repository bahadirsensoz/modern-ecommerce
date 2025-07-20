import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '')

        if (!token) {
            return next()
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload
        if (!decoded?.id) {
            return next()
        }

        const user = await User.findById(decoded.id).select('-password')
        if (!user) {
            return next()
        }

        ; (req as any).user = user
        console.log('Auth middleware: User authenticated:', user._id)
        next()
    } catch (error) {
        console.error('Auth middleware error:', error)
        next()
    }
}
