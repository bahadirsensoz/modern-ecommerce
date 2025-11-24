'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function ChangePasswordPage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }

    logTokenInfo(token, 'ChangePassword')
    if (!isValidJWT(token)) {
      router.push('/login')
      return
    }
  }, [isAuthenticated, token, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match.')
      return
    }

    setLoading(true)

    if (!isAuthenticated || !token) {
      setMessage('Authentication error. Please login again.')
      setLoading(false)
      return
    }

    logTokenInfo(token, 'ChangePasswordSubmit')
    if (!isValidJWT(token)) {
      setMessage('Authentication error. Please login again.')
      setLoading(false)
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess('Password changed successfully. Redirecting to dashboard...')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } else {
      setMessage(data.message || 'Failed to change password.')
    }
  }

  return (
    <div className="page-shell max-w-2xl space-y-6">
      <button onClick={() => router.push('/dashboard')} className="ghost-btn">
        Back to dashboard
      </button>

      <div className="section space-y-4">
        <div className="space-y-1">
          <p className="pill">Account</p>
          <h1 className="headline">Change password</h1>
        </div>

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {success}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="input"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="input"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="input"
            required
          />
          <button
            type="submit"
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change password'}
          </button>
        </form>
      </div>
    </div>
  )
}
