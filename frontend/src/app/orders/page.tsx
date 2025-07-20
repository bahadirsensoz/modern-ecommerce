'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { Order } from '@/types'

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token')
            const sessionId = localStorage.getItem('sessionId')

            try {
                const { data } = await axios.get('http://localhost:5000/api/orders/me', {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        ...(sessionId && { 'X-Session-Id': sessionId })
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
    }, [])

    if (loading) return <p className="p-4">Loading orders...</p>
    if (error) return <p className="p-4 text-red-500">{error}</p>
    if (orders.length === 0) return <p className="p-4">You have no orders yet.</p>

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Order History</h1>
            <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300 rounded">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Order ID</th>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Total</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Paid</th>
                            <th className="p-2 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr
                                key={order._id}
                                className="border-t hover:bg-gray-50 transition-colors"
                            >
                                <td className="p-2 font-medium">
                                    #{order._id.slice(-6).toUpperCase()}
                                </td>
                                <td className="p-2">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2">
                                    ${order.totalPrice.toFixed(2)}
                                </td>
                                <td className="p-2">
                                    <span
                                        className={`px-2 py-1 rounded text-sm font-medium ${order.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : order.status === 'processing'
                                                ? 'bg-blue-100 text-blue-800'
                                                : order.status === 'shipped'
                                                    ? 'bg-indigo-100 text-indigo-800'
                                                    : order.status === 'delivered'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </span>
                                </td>
                                <td className="p-2">
                                    {order.isPaid ? (
                                        <span className="text-green-600">✓ Paid</span>
                                    ) : (
                                        <span className="text-red-600">Pending</span>
                                    )}
                                </td>
                                <td className="p-2">
                                    <Link
                                        href={`/orders/${order._id}`}
                                        className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {orders.length === 0 && !loading && !error && (
                <div className="text-center py-8 text-gray-600">
                    <p>You haven&apos;t placed any orders yet.</p>
                    <Link
                        href="/products"
                        className="text-blue-600 hover:underline mt-2 inline-block"
                    >
                        Start Shopping
                    </Link>
                </div>
            )}
        </div>
    )
}

export default OrderHistoryPage
