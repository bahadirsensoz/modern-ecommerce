'use client'

import { useState } from 'react'
import axios from 'axios'

export default function NewsletterSignup() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribe`, {
                email
            })

            setIsSuccess(true)
            setMessage(response.data.message)
            setEmail('')
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setIsSuccess(false)
                setMessage(error.response?.data?.message || 'Failed to subscribe to newsletter')
            } else {
                setIsSuccess(false)
                setMessage('Failed to subscribe to newsletter')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-lg shadow-lg">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">📧 Stay Updated!</h2>
                <p className="text-white/90">
                    Subscribe to our newsletter for exclusive offers, new products, and fashion tips
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-white/20 bg-gray-400/10 text-white placeholder-white/70 focus:outline-none focus:border-white/40 transition-colors"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gray-400 text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg text-center ${isSuccess
                        ? 'bg-green-500/20 text-green-100 border border-green-500/30'
                        : 'bg-red-500/20 text-red-100 border border-red-500/30'
                        }`}>
                        {message}
                    </div>
                )}
            </form>

            <div className="text-center mt-6">
                <p className="text-white/70 text-sm">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </div>
    )
} 