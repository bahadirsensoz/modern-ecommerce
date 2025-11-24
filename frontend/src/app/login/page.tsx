'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      })

      const data = await res.json()

      if (res.ok) {
        setAuth(data.token, data.user)
        localStorage.setItem('userRole', data.user.role)

        if (data.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        setMessage(data.message || 'Login failed')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="section w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="pill mx-auto w-fit">Welcome back</p>
          <h1 className="headline">Login to your account</h1>
          <p className="subtle">Access your orders, favorites, and personalized picks.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="input"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="input"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {message && (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
              {message}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 text-sm text-slate-300">
            <Link href="/register" className="hover:text-white hover:underline">
              Create account
            </Link>
            <Link href="/forgot-password" className="hover:text-white hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
