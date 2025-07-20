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

            <button
                onClick={() => router.push('/dashboard')}
                className="mb-6 px-4 py-2 bg-black border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-2"
            >
                ← BACK TO DASHBOARD
            </button>

            <h1 className="text-5xl font-black mb-8 transform -rotate-2">CHANGE PASSWORD</h1>



            <form onSubmit={handleSubmit} className="bg-blue-300 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                {success && (
                    <div className="mb-4 bg-green-300 border-4 border-black p-3 font-black">
                        {success}
                    </div>
                )}
                {message && (
                    <div className="mb-4 bg-red-400 text-white border-4 border-black p-3 font-black">
                        {message}
                    </div>
                )}

                <div className="space-y-4">
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="CURRENT PASSWORD"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                        required
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="NEW PASSWORD"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                        required
                    />
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="CONFIRM NEW PASSWORD"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-yellow-300 border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'CHANGING...' : 'CHANGE PASSWORD'}
                    </button>
                </div>
            </form>
        </div>
    )
}
