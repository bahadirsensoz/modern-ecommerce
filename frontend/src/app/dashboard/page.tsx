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
        isDefault?: boolean
        label?: string
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

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
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
            <h1 className="text-5xl font-black mb-8 transform -rotate-2">MY DASHBOARD</h1>

            <div className="bg-pink-200 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4 transform -rotate-1">PROFILE INFO</h2>
                <div className="space-y-2 font-bold">
                    <p className="bg-white border-2 border-black p-2">
                        <span className="font-black">NAME:</span> {user.firstName} {user.lastName}
                    </p>
                    <p className="bg-white border-2 border-black p-2">
                        <span className="font-black">EMAIL:</span> {user.email}
                    </p>
                    <p className="bg-white border-2 border-black p-2">
                        <span className="font-black">PHONE:</span> {user.phone || '-'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <button
                    onClick={() => router.push('/dashboard/edit-profile')}
                    className="p-4 bg-yellow-300 border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                    ✏️ EDIT PROFILE
                </button>
                <button
                    onClick={() => router.push('/dashboard/change-password')}
                    className="p-4 bg-blue-400 text-white border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                    🔒 CHANGE PASSWORD
                </button>
                <button
                    onClick={() => router.push('/dashboard/addresses')}
                    className="p-4 bg-green-300 border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                    📍 MANAGE ADDRESSES
                </button>
            </div>

            <div className="bg-yellow-200 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4 transform -rotate-1">MY ADDRESSES</h2>
                {user.addresses && user.addresses.length > 0 ? (
                    <div className="space-y-3">
                        {user.addresses.map((addr, idx) => (
                            <div key={idx} className="bg-white border-2 border-black p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-black text-lg">
                                        {addr.label || 'ADDRESS ' + (idx + 1)}
                                    </span>
                                    {addr.isDefault && (
                                        <span className="bg-blue-400 text-white px-2 py-1 text-sm border-2 border-black font-bold">
                                            DEFAULT
                                        </span>
                                    )}
                                </div>
                                <p className="font-bold">
                                    {addr.street}, {addr.city}, {addr.country} {addr.postalCode}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="font-bold bg-white border-2 border-black p-3">No addresses saved.</p>
                )}
            </div>
        </div>
    )
}
