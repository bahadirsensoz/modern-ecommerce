'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    firstName?: string
    lastName?: string
    email: string
    phone?: string
    addresses?: Array<{
        street?: string
        city?: string
        country?: string
        postalCode?: string
    }>
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            const res = await fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            })

            if (!res.ok) {
                router.push('/login')
                return
            }

            const data = await res.json()
            setUser(data)
            setLoading(false)
        }

        fetchUser()
    }, [router])

    if (loading) return <p className="p-4">Loading...</p>
    if (!user) return <p className="p-4 text-red-500">Failed to load user data.</p>

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">My Dashboard</h1>

            <div className="mb-6">
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || '-'}</p>
            </div>

            <div className="space-x-3 mb-6">
                <button className="btn" onClick={() => router.push('/dashboard/edit-profile')}>
                    Edit Profile
                </button>
                <button className="btn" onClick={() => router.push('/dashboard/change-password')}>
                    Change Password
                </button>
                <button className="btn" onClick={() => router.push('/dashboard/addresses')}>
                    Manage Addresses
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-2">Addresses</h2>
            {user.addresses && user.addresses.length > 0 ? (
                <ul className="list-disc list-inside">
                    {user.addresses.map((addr, idx) => (
                        <li key={idx}>
                            {addr.street}, {addr.city}, {addr.country} {addr.postalCode}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No addresses saved.</p>
            )}
        </div>
    )
}
