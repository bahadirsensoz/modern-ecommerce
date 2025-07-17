import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { User } from '../models/User'
import { generateToken } from '../utils/generateToken'
import { sendEmail } from '../utils/mailer'

// Register
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
        const verificationToken = crypto.randomBytes(32).toString('hex')

        const newUser = await User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            verificationToken,
            verificationTokenExpires: Date.now() + 30 * 60 * 1000 // 30 minutes
        })

        const verificationUrl = `http://localhost:3000/verify?token=${verificationToken}`
        await sendEmail(
            newUser.email,
            'Verify Your Email',
            `<p>Click the link to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`
        )

        res.status(201).json({ message: 'Registration successful. Please verify your email.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Verify Email
export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query
        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing token' })
        }

        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        })

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' })

        user.emailVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpires = undefined
        await user.save()

        res.json({ message: 'Email verified successfully' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })

        if (!user) return res.status(401).json({ message: 'Invalid credentials' })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' })

        if (!user.emailVerified) {
            return res.status(403).json({ message: 'Please verify your email first.' })
        }

        const token = generateToken(user._id.toString())
        res.json({
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            token
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(404).json({ message: 'No user with that email' })

        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await user.save()

        const resetUrl = `http://localhost:3000/reset-password?token=${token}`
        await sendEmail(
            user.email,
            'Reset Your Password',
            `<p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
        )

        res.json({ message: 'Password reset email sent' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token } = req.query
        const { password } = req.body

        if (!token || typeof token !== 'string') {
            return res.status(400).json({ message: 'Invalid token' })
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        })

        if (!user) return res.status(400).json({ message: 'Invalid or expired token' })

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        res.json({ message: 'Password reset successful' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal server error' })
    }
}
