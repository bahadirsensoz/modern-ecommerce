import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export const protect = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authorized' })
    }

    try {
        const token = authHeader.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
        req.userId = decoded.id
        next()
    } catch (err) {
        res.status(401).json({ message: 'Token invalid' })
    }
}


