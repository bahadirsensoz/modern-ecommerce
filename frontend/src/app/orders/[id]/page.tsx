'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { Order } from '@/types'
import OrderStatusTracker from '@/components/OrderStatusTracker'
import { useCartStore } from '@/store/cartStore'

const OrderDetailsPage = () => {
    const { id } = useParams()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [paymentLoading, setPaymentLoading] = useState(false)
    const { clearCart } = useCartStore()

    useEffect(() => {
        const fetchOrder = async () => {
            const token = localStorage.getItem('token')
            const sessionId = localStorage.getItem('sessionId')

            try {
                console.log('Fetching order:', id)
                const { data } = await axios.get<Order>(
                    `http://localhost:5000/api/orders/${id}`,
                    {
                        headers: {
                            ...(token && { Authorization: `Bearer ${token}` }),
                            ...(sessionId && { 'X-Session-Id': sessionId })
                        },
                        withCredentials: true
                    }
                )
                console.log('Order data received:', data)
                setOrder(data)
                setError('')
            } catch (error: any) {
                console.error('Failed to fetch order:', error.response?.data || error)
                setError(error.response?.data?.message || 'Failed to load order')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id])

    const handlePayment = async () => {
        setPaymentLoading(true)
        setError('')

        try {
            const token = localStorage.getItem('token')
            const sessionId = localStorage.getItem('sessionId')

            const { data } = await axios.post(
                `http://localhost:5000/api/orders/${id}/pay`,
                {},
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        ...(sessionId && { 'X-Session-Id': sessionId })
                    },
                    withCredentials: true
                }
            )

            if (token || sessionId) {
                try {
                    await axios.post(
                        'http://localhost:5000/api/cart/clear',
                        {},
                        {
                            headers: {
                                ...(token && { Authorization: `Bearer ${token}` }),
                                ...(sessionId && { 'X-Session-Id': sessionId })
                            },
                            withCredentials: true
                        }
                    )
                } catch (err) {
                    console.error('Failed to clear cart:', err)
                }
            }

            clearCart()
            localStorage.removeItem('cart-storage')
            localStorage.setItem('cartCleared', 'true')

            setOrder(data.order)
        } catch (error: any) {
            console.error('Payment failed:', error)
            setError(error.response?.data?.message || 'Payment processing failed')
        } finally {
            setPaymentLoading(false)
        }
    }

    if (loading) return <div className="p-4">Loading...</div>
    if (error) return <div className="p-4 text-red-500">{error}</div>
    if (!order) return <div className="p-4">Order not found.</div>

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Order #{order._id}</h1>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Status</h2>
                <OrderStatusTracker status={order.status.charAt(0).toUpperCase() + order.status.slice(1) as 'Pending' | 'Processing' | 'Shipped' | 'Delivered'} />
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Shipping Info</h2>
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Items</h2>
                <ul className="space-y-4">
                    {order.orderItems.map((item) => (
                        <li key={item._id} className="flex items-center border p-4 rounded-lg shadow-sm">
                            {item.product.image && (
                                <div className="w-20 h-20 relative mr-4">
                                    <Image
                                        src={item.product.image}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                            )}
                            <div className="flex-grow">
                                <h3 className="font-medium">{item.product.name}</h3>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                            </div>
                            <div className="text-right">
                                <p className="font-medium">${item.product.price.toFixed(2)}</p>
                                <p className="text-sm text-gray-600">
                                    Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="mt-6 border-t pt-4">
                <div className="text-right">
                    <p className="text-lg">Total: <span className="font-bold">${order.totalPrice.toFixed(2)}</span></p>
                </div>
            </div>

            {/* Add payment section */}
            {order && !order.isPaid && (
                <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Payment</h2>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-lg">Total to pay: ${order.totalPrice.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">Payment method: {order.paymentMethod}</p>
                        </div>
                        <button
                            onClick={handlePayment}
                            disabled={paymentLoading}
                            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            {paymentLoading ? 'Processing...' : 'Pay Now'}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-red-500">{error}</p>
                    )}
                </div>
            )}

            {/* Show paid status if payment is complete */}
            {order?.isPaid && (
                <div className="mt-8 border-t pt-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                        <p className="text-green-700">
                            Payment completed on {new Date(order.paidAt!).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderDetailsPage
