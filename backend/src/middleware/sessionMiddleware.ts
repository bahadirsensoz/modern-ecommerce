import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'

export const assignSessionId = (req: Request, res: Response, next: NextFunction) => {
  let sessionId = req.cookies.sessionId

  if (!sessionId) {
    sessionId = uuidv4()
    res.cookie('sessionId', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })
  }

  req.cookies.sessionId = sessionId
  next()
}
