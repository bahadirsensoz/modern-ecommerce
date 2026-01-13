'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function EditProfilePage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push('/login')
      return
    }

    logTokenInfo(token, 'EditProfile')
    if (!isValidJWT(token)) {
      router.push('/login')
      return
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setFirstName(data.firstName || '')
        setLastName(data.lastName || '')
        setPhone(data.phone || '')
      })
      .catch(() => router.push('/login'))
  }, [isAuthenticated, token, router])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess('')

    if (!isAuthenticated || !token) {
      setMessage('Authentication error. Please login again.')
      setLoading(false)
      return
    }

    logTokenInfo(token, 'EditProfileUpdate')
    if (!isValidJWT(token)) {
      setMessage('Authentication error. Please login again.')
      setLoading(false)
      return
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify({ firstName, lastName, phone }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      setSuccess('Profile updated successfully. Redirecting to dashboard...')
      localStorage.setItem('user', JSON.stringify(data.user))
      setTimeout(() => router.push('/dashboard'), 1500)
    } else {
      setMessage(data.message || 'Failed to update profile.')
    }
  }

  return (
    <div className="page-shell max-w-2xl space-y-6">
      <button onClick={() => router.push('/dashboard')} className="ghost-btn dark:text-gray-300 dark:hover:bg-slate-800">
        Back to dashboard
      </button>

      <div className="section space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="space-y-1">
          <p className="pill">Account</p>
          <h1 className="headline dark:text-white">Edit profile</h1>
        </div>

        {success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">
            {success}
          </div>
        )}
        {message && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            placeholder="First name"
            className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
          <input
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            placeholder="Last name"
            className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Phone"
            className="input dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
          <button
            type="submit"
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
