'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function EditProfilePage() {
    const router = useRouter()
    const { isAuthenticated, token } = useAuthStore()
    const [user, setUser] = useState<User | null>(null)
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
            console.error('Invalid JWT token in EditProfile')
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
                setUser(data)
                setFirstName(data.firstName || '')
                setLastName(data.lastName || '')
                setPhone(data.phone || '')
            })
            .catch(() => router.push('/login'))
    }, [router])

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
            console.error('Invalid JWT token in EditProfileUpdate')
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
            setSuccess('✅ Profile updated successfully. Redirecting to dashboard...')
            localStorage.setItem('user', JSON.stringify(data.user))
            setTimeout(() => router.push('/dashboard'), 2000)
        } else {
            setMessage(data.message || 'Failed to update profile.')
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

            <h1 className="text-5xl font-black mb-8 transform -rotate-2">EDIT PROFILE</h1>



            <form onSubmit={handleUpdate} className="bg-pink-200 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="FIRST NAME"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                    />
                    <input
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="LAST NAME"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                    />
                    <input
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="PHONE"
                        className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                    />
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-400 text-white border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            </form>
        </div>
    )
}
