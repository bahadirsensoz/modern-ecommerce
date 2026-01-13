'use client'

import { useEffect, useState, useCallback } from 'react'
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

  const fetchData = useCallback(async () => {
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
  }, [token])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setError('Authentication required')
      setLoading(false)
      return
    }
    fetchData()
  }, [isAuthenticated, token, fetchData])

  if (loading) {
    return <div className="page-shell text-sm text-gray-600">Loading...</div>
  }

  if (error) {
    return <div className="page-shell text-sm text-red-500">{error}</div>
  }

  return (
    <div className="page-shell space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="pill">Admin</p>
          <h1 className="headline">Newsletter</h1>
        </div>
        <button onClick={fetchData} className="ghost-btn text-sm">Refresh</button>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="section p-4">
            <h3 className="text-sm text-gray-500">Total Subscribers</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalSubscribers}</p>
          </div>
          <div className="section p-4">
            <h3 className="text-sm text-gray-500">New This Month</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.newThisMonth}</p>
          </div>
          <div className="section p-4">
            <h3 className="text-sm text-gray-500">Unsubscribed</h3>
            <p className="text-3xl font-semibold text-red-600">{stats.totalUnsubscribed}</p>
          </div>
          <div className="section p-4">
            <h3 className="text-sm text-gray-500">Total Subscriptions</h3>
            <p className="text-3xl font-semibold text-gray-900">{stats.totalSubscriptions}</p>
          </div>
        </div>
      )}

      <div className="section overflow-x-auto">
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-semibold text-gray-900">Active subscribers ({subscribers.length})</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="p-2 font-medium">Email</th>
              <th className="p-2 font-medium">Status</th>
              <th className="p-2 font-medium">Subscribed</th>
              <th className="p-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber._id} className="border-t border-gray-200">
                <td className="p-2 text-gray-900">{subscriber.email}</td>
                <td className="p-2">
                  <span className={`pill text-xs ${subscriber.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {subscriber.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-2 text-gray-700">
                  {new Date(subscriber.subscribedAt).toLocaleDateString()}
                </td>
                <td className="p-2 text-[#f68b1e] font-semibold">
                  <button
                    onClick={() => navigator.clipboard.writeText(subscriber.email)}
                    className="hover:underline"
                  >
                    Copy email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {subscribers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No subscribers found
          </div>
        )}
      </div>
    </div>
  )
}
