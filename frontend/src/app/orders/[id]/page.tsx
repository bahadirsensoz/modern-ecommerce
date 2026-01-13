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
          : 'Failed to load order'
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
        } catch {
          // ignore
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

  if (loading) return <div className="page-shell text-sm text-gray-600">Loading...</div>
  if (error) return <div className="page-shell text-sm text-red-500">{error}</div>
  if (!order) return <div className="page-shell">Order not found.</div>

  return (
    <div className="page-shell space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="pill">Order details</p>
          <h1 className="headline">Order #{order._id}</h1>
        </div>
        {!order.isPaid && (
          <button onClick={handlePayment} disabled={paymentLoading} className="primary-btn text-sm disabled:opacity-60">
            {paymentLoading ? 'Processing...' : 'Complete payment'}
          </button>
        )}
      </div>

      <div className="section space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Status</h2>
          <OrderStatusTracker status={order.status.charAt(0).toUpperCase() + order.status.slice(1) as 'Pending' | 'Processing' | 'Shipped' | 'Delivered'} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface rounded-lg p-4 text-sm text-gray-700">
            <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
          </div>
          <div className="surface rounded-lg p-4 text-sm text-gray-700">
            <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
            <p>Status: {order.isPaid ? 'Paid' : 'Pending'}</p>
            <p>Total: ${order.totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="section space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">Items</h2>
        <ul className="space-y-4">
          {order.orderItems.map((item) => {
            if (!item.product) {
              return (
                <li key={item._id} className="surface rounded-lg p-4 text-sm text-gray-600">
                  Product not available · Qty: {item.quantity}
                </li>
              )
            }

            return (
              <li key={item._id} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {item.product.image && (
                    <div className="relative h-16 w-16 overflow-hidden rounded">
                      <Image
                        src={item.product.image}
                        alt={item.product.name || 'Product image'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold text-gray-900">{item.product.name || 'Unnamed Product'}</p>
                    <p>Qty: {item.quantity}</p>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">${(item.product.price || 0).toFixed(2)}</p>
                  <p className="text-gray-500">Subtotal: ${((item.product.price || 0) * item.quantity).toFixed(2)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default OrderDetailsPage
