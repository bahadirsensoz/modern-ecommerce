'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { Order } from '@/types'
import OrderStatusTracker from '@/components/OrderStatusTracker'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

const OrderDetailsPage = () => {
    const { id } = useParams()
    const { isAuthenticated, token } = useAuthStore()
    const { sessionId, clearCart } = useCartStore()
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [paymentLoading, setPaymentLoading] = useState(false)

    useEffect(() => {
        const fetchOrder = async () => {
            // Prepare headers for both auth and guest
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (isAuthenticated && token) {
                logTokenInfo(token, 'OrderDetail')
                if (!isValidJWT(token)) {
                    setError('Authentication error. Please login again.')
                    setLoading(false)
                    return
                }
                headers['Authorization'] = `Bearer ${token}`
            } else if (sessionId) {
                headers['x-session-id'] = sessionId
            } else {
                setError('Session not found. Please try again from the device you placed the order.')
                setLoading(false)
                return
            }

            try {
                const { data } = await axios.get<Order>(
                    `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`,
                    {
                        headers,
                        withCredentials: true
                    }
                )
                setOrder(data)
                setError('')
            } catch (error: unknown) {
                const errorMessage = axios.isAxiosError(error)
                    ? error.response?.data?.message || 'Failed to load order'
                    : 'Failed to load order';
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchOrder()
        }
    }, [id, isAuthenticated, token, sessionId])

    const handlePayment = async () => {
        setPaymentLoading(true)
        setError('')

        try {
            // Prepare headers for both auth and guest
            const headers: Record<string, string> = { 'Content-Type': 'application/json' }
            if (isAuthenticated && token) {
                logTokenInfo(token, 'OrderPayment')
                if (!isValidJWT(token)) {
                    setError('Authentication error. Please login again.')
                    setPaymentLoading(false)
                    return
                }
                headers['Authorization'] = `Bearer ${token}`
            } else if (sessionId) {
                headers['x-session-id'] = sessionId
            } else {
                setError('Session not found. Please try again from the device you placed the order.')
                setPaymentLoading(false)
                return
            }

            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/pay`,
                {},
                {
                    headers,
                    withCredentials: true
                }
            )

            // Only try to clear cart for logged-in users
            if (isAuthenticated && token) {
                try {
                    await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/cart/clear`,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            withCredentials: true
                        }
                    )
                } catch (err) {
                    // Ignore cart clear error for guests
                }
            }

            clearCart()
            localStorage.removeItem('cart-storage')
            localStorage.setItem('cartCleared', 'true')

            setOrder(data.order)
        } catch (error: unknown) {
            setError(axios.isAxiosError(error) ? error.response?.data?.message || 'Payment processing failed' : 'Payment processing failed')
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
                    {order.orderItems.map((item) => {
                        // Handle case where product data is missing
                        if (!item.product) {
                            return (
                                <li key={item._id} className="flex items-center border p-4 rounded-lg shadow-sm bg-gray-100">
                                    <div className="flex-grow">
                                        <h3 className="font-medium text-gray-500">Product not available</h3>
                                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                        {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-500">Price unavailable</p>
                                    </div>
                                </li>
                            )
                        }

                        return (
                            <li key={item._id} className="flex items-center border p-4 rounded-lg shadow-sm">
                                {item.product.image && (
                                    <div className="w-20 h-20 relative mr-4">
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name || 'Product image'}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <h3 className="font-medium">{item.product.name || 'Unnamed Product'}</h3>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                    {item.size && <p className="text-sm text-gray-600">Size: {item.size}</p>}
                                    {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">${(item.product.price || 0).toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">
                                        Subtotal: ${((item.product.price || 0) * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <div className="mt-6 border-t pt-4">
                <h2 className="text-xl font-semibold mb-2">Price Details</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>${order.orderItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Tax (18%):</span>
                        <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span>${order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>${order.totalPrice.toFixed(2)}</span>
                    </div>
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
