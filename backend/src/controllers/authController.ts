import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { User } from '../models/User'
import { sendEmail } from '../utils/mailer'
import validator from 'validator'


const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
const JWT_SECRET = process.env.JWT_SECRET as string

if (!JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables')
}

// Register
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }
        const sanitizedEmail = validator.normalizeEmail(email) || email
        const sanitizedFirstName = firstName ? validator.escape(firstName) : ''
        const sanitizedLastName = lastName ? validator.escape(lastName) : ''

        const existingUser = await User.findOne({ email: sanitizedEmail })
        if (existingUser) {
            return res.status(409).json({ message: 'Email already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const verificationToken = crypto.randomBytes(32).toString('hex')

        const newUser = await User.create({
            email: sanitizedEmail,
            password: hashedPassword,
            firstName: sanitizedFirstName,
            lastName: sanitizedLastName,
            verificationToken,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
            emailVerified: false
        })

        const verificationUrl = `${frontendUrl}/verify?token=${verificationToken}`
        await sendEmail(
            newUser.email,
            'Verify Your Email',
            `<p>Click the link to verify your email:</p><a href="${verificationUrl}">${verificationUrl}</a>`
        )

        return res.status(201).json({ message: 'Registration successful. Please verify your email.' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
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

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' })
        }

        user.emailVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpires = undefined
        await user.save()

        return res.status(200).json({ message: 'Email verified successfully' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

// Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' })
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        if (user.emailVerified !== true) {
            return res.status(403).json({ message: 'Please verify your email first.' })
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, {
            expiresIn: '30d'
        })

        res.json({
            token,
            user: {
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                addresses: user.addresses || [],
                favorites: user.favorites || [],
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// Forgot Password
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'No user with that email' })
        }

        const token = crypto.randomBytes(32).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        await user.save()

        const resetUrl = `${frontendUrl}/reset-password?token=${token}`
        await sendEmail(
            user.email,
            'Reset Your Password',
            `<p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
        )

        return res.status(200).json({ message: 'Password reset email sent' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
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
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' })
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        })

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await user.save()

        return res.status(200).json({ message: 'Password reset successful' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
