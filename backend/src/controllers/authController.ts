import { Request, Response } from 'express'

export const registerUser = async (req: Request, res: Response) => {
    return res.send('Register route')
}

export const loginUser = async (req: Request, res: Response) => {
    return res.send('Login route')
}
