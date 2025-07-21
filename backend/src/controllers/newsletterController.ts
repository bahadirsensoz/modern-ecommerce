import { Request, Response } from 'express'
import { Newsletter } from '../models/Newsletter'
import { sendNewsletterSignupEmail } from '../utils/mailer'

export const subscribeToNewsletter = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' })
        }

        const existingSubscription = await Newsletter.findOne({ email: email.toLowerCase() })

        if (existingSubscription) {
            if (existingSubscription.isActive) {
                return res.status(400).json({ message: 'You are already subscribed to our newsletter' })
            } else {
                existingSubscription.isActive = true
                existingSubscription.unsubscribedAt = undefined
                await existingSubscription.save()

                try {
                    await sendNewsletterSignupEmail(email)
                } catch (emailError) {
                    console.error('Failed to send newsletter signup email:', emailError)
                }

                return res.status(200).json({
                    message: 'Welcome back! You have been resubscribed to our newsletter',
                    subscription: existingSubscription
                })
            }
        }

        const subscription = new Newsletter({
            email: email.toLowerCase()
        })
        await subscription.save()

        try {
            await sendNewsletterSignupEmail(email)
        } catch (emailError) {
            console.error('Failed to send newsletter signup email:', emailError)
        }

        res.status(201).json({
            message: 'Successfully subscribed to newsletter',
            subscription
        })
    } catch (error) {
        console.error('Newsletter subscription error:', error)
        res.status(500).json({
            message: 'Failed to subscribe to newsletter',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const unsubscribeFromNewsletter = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Email is required' })
        }

        const subscription = await Newsletter.findOne({ email: email.toLowerCase() })

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' })
        }

        if (!subscription.isActive) {
            return res.status(400).json({ message: 'You are already unsubscribed' })
        }

        subscription.isActive = false
        subscription.unsubscribedAt = new Date()
        await subscription.save()

        res.status(200).json({
            message: 'Successfully unsubscribed from newsletter',
            subscription
        })
    } catch (error) {
        console.error('Newsletter unsubscription error:', error)
        res.status(500).json({
            message: 'Failed to unsubscribe from newsletter',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const getAllSubscribers = async (req: Request, res: Response) => {
    try {
        const subscribers = await Newsletter.find({ isActive: true })
            .sort({ subscribedAt: -1 })
            .select('-__v')

        res.status(200).json({
            count: subscribers.length,
            subscribers
        })
    } catch (error) {
        console.error('Get subscribers error:', error)
        res.status(500).json({
            message: 'Failed to fetch subscribers',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
}

export const getSubscriberStats = async (req: Request, res: Response) => {
    try {
        const totalSubscribers = await Newsletter.countDocuments({ isActive: true })
        const totalUnsubscribed = await Newsletter.countDocuments({ isActive: false })
        const newThisMonth = await Newsletter.countDocuments({
            isActive: true,
            subscribedAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
        })

        res.status(200).json({
            totalSubscribers,
            totalUnsubscribed,
            newThisMonth,
            totalSubscriptions: totalSubscribers + totalUnsubscribed
        })
    } catch (error) {
        console.error('Get subscriber stats error:', error)
        res.status(500).json({
            message: 'Failed to fetch subscriber statistics',
            error: error instanceof Error ? error.message : 'Unknown error'
        })
    }
} 