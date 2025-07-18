'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EditProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [phone, setPhone] = useState('')
    const [message, setMessage] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) return router.push('/login')

        fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
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

        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:5000/api/users/me', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
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
            <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

            {success && (
                <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded">
                    {success}
                </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
                <input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="input"
                />
                <input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="input"
                />
                <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="input"
                />
                <button type="submit" className="btn w-full" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                {message && <p className="text-sm text-red-500">{message}</p>}
            </form>
        </div>
    )
}
