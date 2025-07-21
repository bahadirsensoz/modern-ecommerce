import { Request, Response, NextFunction } from 'express'

export const requestCounts = new Map<string, { count: number; resetTime: number }>()

const adminIPs = ['127.0.0.1', '::1', 'localhost']

export const resetRateLimits = () => {
    requestCounts.clear()
}

const createRateLimiter = (maxRequests: number, windowMs: number) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown'
        const now = Date.now()

        if (adminIPs.includes(ip)) {
            return next()
        }

        const userRequests = requestCounts.get(ip)

        if (!userRequests || now > userRequests.resetTime) {
            requestCounts.set(ip, { count: 1, resetTime: now + windowMs })
            return next()
        }

        if (userRequests.count >= maxRequests) {
            return res.status(429).json({
                message: 'Too many requests, please try again later.'
            })
        }

        userRequests.count++
        next()
    }
}

export const generalLimiter = createRateLimiter(2000, 1 * 60 * 1000)

export const authLimiter = createRateLimiter(10000, 1 * 60 * 1000)

export const apiLimiter = createRateLimiter(5000, 1 * 60 * 1000)