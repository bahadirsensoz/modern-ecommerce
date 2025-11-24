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
    <div className="section space-y-4">
      <div className="space-y-2 text-center">
        <p className="pill mx-auto w-fit">Weekly highlights</p>
        <h2 className="headline">Get deals and fresh arrivals.</h2>
        <p className="subtle mx-auto max-w-2xl">
          Short, useful updates only—product drops, limited offers, and style tips.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="input"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="primary-btn whitespace-nowrap sm:w-44"
        >
          {loading ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>

      {message && (
        <div
          className={`mx-auto w-full max-w-xl rounded-lg border px-4 py-3 text-sm font-semibold ${isSuccess
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
        >
          {message}
        </div>
      )}

      <p className="subtle text-center text-sm">
        You can unsubscribe anytime.
      </p>
    </div>
  )
}
