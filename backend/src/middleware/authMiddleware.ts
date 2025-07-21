import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User, IUser } from '../models/User'

interface AuthRequest extends Request {
    user?: IUser
}

interface JwtPayload {
    id: string
    iat?: number
    exp?: number
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined

        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Not authorized - Invalid token format' })
        }

        token = authHeader.split(' ')[1]

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined')
            return res.status(500).json({ message: 'Server configuration error' })
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload

            const user = await User.findById(decoded.id).select('-password')
            if (!user) {
                return res.status(401).json({ message: 'User not found' })
            }

            req.user = user
            next()
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError)
            return res.status(401).json({ message: 'Not authorized - Invalid token' })
        }
    } catch (error) {
        console.error('Auth middleware error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}
