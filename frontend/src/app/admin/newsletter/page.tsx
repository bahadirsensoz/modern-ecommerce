'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import axios from 'axios'

interface Subscriber {
    _id: string
    email: string
    isActive: boolean
    subscribedAt: string
    unsubscribedAt?: string
}

interface Stats {
    totalSubscribers: number
    totalUnsubscribed: number
    newThisMonth: number
    totalSubscriptions: number
}

export default function NewsletterAdminPage() {
    const { token, isAuthenticated } = useAuthStore()
    const [subscribers, setSubscribers] = useState<Subscriber[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isAuthenticated || !token) {
            setError('Authentication required')
            setLoading(false)
            return
        }

        fetchData()
    }, [isAuthenticated, token])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [subscribersRes, statsRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/subscribers`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/newsletter/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ])

            setSubscribers(subscribersRes.data.subscribers)
            setStats(statsRes.data)
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Failed to fetch data')
            } else {
                setError('Failed to fetch data')
            }
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-yellow-200 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center">Loading...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-yellow-200 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center text-red-600">{error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-yellow-200 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-black mb-8 text-center">📧 Newsletter Management</h1>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-bold text-gray-600">Total Subscribers</h3>
                            <p className="text-3xl font-black text-green-600">{stats.totalSubscribers}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-bold text-gray-600">New This Month</h3>
                            <p className="text-3xl font-black text-blue-600">{stats.newThisMonth}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-bold text-gray-600">Unsubscribed</h3>
                            <p className="text-3xl font-black text-red-600">{stats.totalUnsubscribed}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="text-lg font-bold text-gray-600">Total Subscriptions</h3>
                            <p className="text-3xl font-black text-purple-600">{stats.totalSubscriptions}</p>
                        </div>
                    </div>
                )}

                {/* Subscribers Table */}
                <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-gray-100 p-4 border-b-4 border-black">
                        <h2 className="text-2xl font-black">Active Subscribers ({subscribers.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                                        Subscribed Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscribers.map((subscriber) => (
                                    <tr key={subscriber._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {subscriber.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subscriber.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {subscriber.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => {
                                                    // Copy email to clipboard
                                                    navigator.clipboard.writeText(subscriber.email)
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                Copy Email
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {subscribers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No subscribers found
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 