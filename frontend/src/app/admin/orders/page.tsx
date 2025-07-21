'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import axios, { AxiosError } from 'axios'
import { Order, OrderItem, OrderStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

const orderStatuses = ['pending', 'processing', 'shipped', 'delivered']

function OrderDetailModal({ order, open, onClose, onStatusChange }: {
    order: Order | null,
    open: boolean,
    onClose: () => void,
    onStatusChange: (orderId: string, status: OrderStatus) => void
}) {
    if (!open || !order) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-4 border-black w-full max-w-lg">
                <h2 className="text-2xl font-black mb-2">Order #{order._id}</h2>
                <div className="mb-2">Placed: {new Date(order.createdAt).toLocaleDateString()}</div>
                <div className="mb-2">Customer: {order.shippingAddress.fullName}</div>
                <div className="mb-2">Email: {order.email}</div>
                <div className="mb-2">Shipping: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}</div>
                <div className="mb-2">Status:
                    <select
                        value={order.status}
                        onChange={e => onStatusChange(order._id, e.target.value as OrderStatus)}
                        className="ml-2 p-2 border-2 border-black font-bold"
                    >
                        {orderStatuses.map(status => (
                            <option key={status} value={status}>{status.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-2 font-bold">Items:</div>
                <div className="max-h-40 overflow-y-auto mb-2">
                    {order.orderItems.map((item: OrderItem) => (
                        <div key={item._id} className="flex justify-between items-center border-t pt-2">
                            <span>{item.product ? item.product.name : 'Product not available'} x {item.quantity}</span>
                            <span className="font-bold">₺{((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-2 font-bold">
                    <div className="flex justify-between"><span>Subtotal:</span><span>₺{order.subtotal}</span></div>
                    <div className="flex justify-between"><span>Tax:</span><span>₺{order.tax}</span></div>
                    <div className="flex justify-between"><span>Shipping:</span><span>₺{order.shipping}</span></div>
                    <div className="flex justify-between text-lg border-t pt-2"><span>Total:</span><span>₺{order.totalPrice}</span></div>
                </div>
                <button className="mt-4 bg-gray-300 px-4 py-2 font-bold border-2 border-black" onClick={onClose}>Close</button>
            </div>
        </div>
    )
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>('')
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const { isAuthenticated, token } = useAuthStore()

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')
            if (!isAuthenticated || !token) {
                throw new Error('No authentication token found')
            }
            logTokenInfo(token, 'AdminOrdersFetch')
            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminOrdersFetch')
                throw new Error('Authentication error. Please login again.')
            }
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/all`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
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

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            if (!isAuthenticated || !token) {
                setError('Authentication error. Please login again.')
                return
            }
            logTokenInfo(token, 'AdminUpdateOrderStatus')
            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminUpdateOrderStatus')
                setError('Authentication error. Please login again.')
                return
            }
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            )
            fetchOrders()
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder({ ...selectedOrder, status })
            }
        } catch (error: unknown) {
            const message = axios.isAxiosError(error) ? error.response?.data?.message || error.message : error instanceof Error ? error.message : 'Failed to update status'
            console.error('Failed to update order status:', message)
            setError(message)
        }
    }

    const filtered = orders.filter(order => {
        const searchLower = search.toLowerCase()
        return (
            (!statusFilter || order.status === statusFilter) &&
            (
                order._id.toLowerCase().includes(searchLower) ||
                order.email.toLowerCase().includes(searchLower) ||
                order.shippingAddress.fullName.toLowerCase().includes(searchLower)
            )
        )
    })

    if (loading) return <div className="p-4">Loading...</div>

    return (
        <AdminGuard>
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">MANAGE ORDERS</h1>
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border-4 border-red-500 text-red-700">{error}</div>
                )}
                <div className="flex gap-4 mb-6">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by order ID, customer, or email"
                        className="p-3 border-4 border-black font-bold flex-1"
                    />
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as OrderStatus)}
                        className="p-3 border-4 border-black font-bold"
                    >
                        <option value="">All Statuses</option>
                        {orderStatuses.map(status => (
                            <option key={status} value={status}>{status.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-4">
                    {filtered.map((order) => (
                        <div key={order._id} className="bg-white p-6 border-4 border-black">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">Order #{order._id}</h2>
                                    <p className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    <p className="font-bold">Customer: {order.shippingAddress.fullName}</p>
                                    <p className="text-gray-600">Email: {order.email}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <select
                                        value={order.status}
                                        onChange={e => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                                        className="p-2 border-4 border-black font-bold"
                                    >
                                        {orderStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        className="bg-blue-400 text-white font-black px-4 py-2 border-2 border-black mt-2"
                                        onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                                    >
                                        VIEW
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {order.orderItems.map((item: OrderItem) => (
                                    <div key={item._id} className="flex justify-between items-center border-t pt-2">
                                        <span>
                                            {item.product ? item.product.name : 'Product not available'} x {item.quantity}
                                        </span>
                                        <span className="font-bold">
                                            ₺{((item.product?.price || 0) * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                                <div className="border-t pt-2 font-bold">
                                    <div className="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>₺{order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tax:</span>
                                        <span>₺{order.tax}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>₺{order.shipping}</span>
                                    </div>
                                    <div className="flex justify-between text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>₺{order.totalPrice}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <OrderDetailModal
                    order={selectedOrder}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onStatusChange={updateOrderStatus}
                />
            </div>
        </AdminGuard>
    )
}