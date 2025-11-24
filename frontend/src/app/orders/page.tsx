'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Order } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

const statusStyle = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    case 'processing': return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'shipped': return 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    case 'delivered': return 'bg-green-50 text-green-700 border border-green-200'
    default: return 'bg-gray-50 text-gray-700 border border-gray-200'
  }
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false)
        return
      }

      logTokenInfo(token, 'OrdersPage')

      if (!isValidJWT(token)) {
        console.error('Invalid JWT token in OrdersPage')
        setError('Authentication error. Please login again.')
        setLoading(false)
        return
      }

      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        })

        setOrders(data)
        setError('')
      } catch (err: Error | unknown) {
        console.error('Failed to fetch orders:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, token])

  if (loading) return <p className="page-shell text-sm text-gray-600">Loading orders...</p>
  if (error) return <p className="page-shell text-sm text-red-500">{error}</p>

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="pill">Order history</p>
          <h1 className="headline">Your orders</h1>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="section text-gray-700">
          You have no orders yet.
        </div>
      ) : (
        <div className="section overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="p-2 font-medium">Order</th>
                <th className="p-2 font-medium">Date</th>
                <th className="p-2 font-medium">Total</th>
                <th className="p-2 font-medium">Status</th>
                <th className="p-2 font-medium">Paid</th>
                <th className="p-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id} className="border-t border-gray-200">
                  <td className="p-2 font-semibold text-gray-900">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-2 text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-2 text-gray-900">${order.totalPrice.toFixed(2)}</td>
                  <td className="p-2">
                    <span className={`pill ${statusStyle(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-2 text-gray-700">
                    {order.isPaid ? (
                      <span className="text-green-600 font-semibold">Paid</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Pending</span>
                    )}
                  </td>
                  <td className="p-2">
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-[#f68b1e] font-semibold hover:underline"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrderHistoryPage
