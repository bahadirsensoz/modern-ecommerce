'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const result = await res.json()

    if (res.ok) {
      setMessage('Password reset successful. You will be redirected to login.')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      setError(result.message || 'Failed to reset password.')
    }
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="section w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="pill mx-auto w-fit">Secure reset</p>
          <h1 className="headline">Create a new password</h1>
          <p className="subtle">Choose a strong password to keep your account safe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm password"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="primary-btn w-full justify-center">
            Reset password
          </button>

          {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
          {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="page-shell text-sm text-gray-600">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
