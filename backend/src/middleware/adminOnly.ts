import { Request, Response, NextFunction } from 'express'

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' })
    }
    next()
}
