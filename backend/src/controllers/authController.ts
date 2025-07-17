import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import { User } from '../models/User'
import { generateToken } from '../utils/generateToken'

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        })

        const token = generateToken(newUser._id.toString())

        res.status(201).json({
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
            token,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}


export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email })
        if (!user) return res.status(401).json({ message: 'Invalid credentials' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

        const token = generateToken(user._id.toString())

        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            token,
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}