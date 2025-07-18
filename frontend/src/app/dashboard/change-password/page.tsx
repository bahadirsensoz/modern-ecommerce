'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
    const router = useRouter()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) router.push('/login')
    }, [router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')
        setSuccess('')

        if (newPassword !== confirmPassword) {
            setMessage('New passwords do not match.')
            return
        }

        setLoading(true)
        const token = localStorage.getItem('token')

        const res = await fetch('http://localhost:5000/api/users/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        })

        const data = await res.json()
        setLoading(false)

        if (res.ok) {
            setSuccess('✅ Password changed successfully. Redirecting to dashboard...')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => {
                router.push('/dashboard')
            }, 2000)
        } else {
            setMessage(data.message || 'Failed to change password.')
        }
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Change Password</h1>

            {success && (
                <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
                    {success}
                </div>
            )}
            {message && (
                <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current Password"
                    className="input"
                    required
                />
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="input"
                    required
                />
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="input"
                    required
                />
                <button
                    type="submit"
                    className="btn w-full"
                    disabled={loading}
                >
                    {loading ? 'Changing...' : 'Change Password'}
                </button>
            </form>
        </div>
    )
}
