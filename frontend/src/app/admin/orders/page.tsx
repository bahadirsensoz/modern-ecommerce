'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import axios, { AxiosError } from 'axios'
import { Order, OrderItem } from '@/types'


const orderStatuses = ['pending', 'processing', 'shipped', 'delivered']

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')

            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const { data } = await axios.get('http://localhost:5000/api/orders/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setOrders(data)
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : 'Failed to fetch orders'
            console.error('Failed to fetch orders:', message)
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            const token = localStorage.getItem('token')
            await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            fetchOrders()
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : 'Failed to update status'
            console.error('Failed to update order status:', message)
            setError(message)
        }
    }

    if (loading) return <div className="p-4">Loading...</div>

    return (
        <AdminGuard>
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">MANAGE ORDERS</h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 text-red-700">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white p-6 border-4 border-black">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">Order #{order._id}</h2>
                                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="font-bold">Customer: {order.shippingAddress.fullName}</p>
                                    <p className="text-gray-600">Email: {order.email}</p>
                                </div>
                                <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                    className="p-2 border-4 border-black font-bold"
                                >
                                    {orderStatuses.map((status) => (
                                        <option key={status} value={status}>
                                            {status.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                {order.orderItems.map((item: OrderItem) => (
                                    <div key={item._id} className="flex justify-between items-center border-t pt-2">
                                        <span>{item.product.name} x {item.quantity}</span>
                                        <span className="font-bold">${item.product.price * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 font-bold">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>${order.tax}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>${order.shipping}</span>
                                    </div>
                                    <div className="flex justify-between text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>${order.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminGuard>
    )
}