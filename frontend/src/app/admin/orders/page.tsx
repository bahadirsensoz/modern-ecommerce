'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import axios from 'axios'
import { Order, OrderItem, OrderStatus } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

function OrderDetailModal({ order, open, onClose, onStatusChange }: {
  order: Order | null,
  open: boolean,
  onClose: () => void,
  onStatusChange: (orderId: string, status: OrderStatus) => void
}) {
  if (!open || !order) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="section w-full max-w-lg space-y-3 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order #{order._id}</h2>
          <select
            value={order.status}
            onChange={e => onStatusChange(order._id, e.target.value as OrderStatus)}
            className="input w-fit dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-700 space-y-1 dark:text-gray-300">
          <p>Placed: {new Date(order.createdAt).toLocaleDateString()}</p>
          <p>Customer: {order.shippingAddress.fullName}</p>
          <p>Email: {order.email}</p>
          <p>Shipping: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}</p>
        </div>
        <div className="border-t pt-2 text-sm text-gray-700 space-y-2 dark:border-slate-700 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white">Items</p>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {order.orderItems.map((item: OrderItem) => (
              <div key={item._id} className="flex justify-between text-sm">
                <span>{item.product ? item.product.name : 'Product not available'} x {item.quantity}</span>
                <span className="font-semibold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1 pt-2 border-t text-sm dark:border-slate-700">
            <div className="flex justify-between"><span>Subtotal:</span><span>${order.subtotal}</span></div>
            <div className="flex justify-between"><span>Tax:</span><span>${order.tax}</span></div>
            <div className="flex justify-between"><span>Shipping:</span><span>${order.shipping}</span></div>
            <div className="flex justify-between border-t pt-1 font-semibold text-gray-900 dark:border-slate-700 dark:text-white"><span>Total:</span><span>${order.totalPrice}</span></div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button className="ghost-btn text-sm dark:text-gray-400 dark:hover:bg-slate-700" onClick={onClose}>Close</button>
        </div>
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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      if (!isAuthenticated || !token) {
        // Avoid throwing here as it might happen during logout/initial load
        setLoading(false)
        return
      }
      logTokenInfo(token, 'AdminOrdersFetch')
      if (!isValidJWT(token)) {
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
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      if (!isAuthenticated || !token) {
        setError('Authentication error. Please login again.')
        return
      }
      logTokenInfo(token, 'AdminUpdateOrderStatus')
      if (!isValidJWT(token)) {
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

  if (loading) return <div className="page-shell text-sm text-gray-600">Loading...</div>

  return (
    <AdminGuard>
      <div className="page-shell space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline dark:text-white">Manage orders</h1>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="section flex flex-wrap gap-3 dark:bg-slate-800 dark:border-slate-700">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, customer, or email"
            className="input flex-1 min-w-[200px] dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as OrderStatus)}
            className="input w-full sm:w-48 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
          >
            <option value="">All statuses</option>
            {orderStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="section space-y-3 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Order #{order._id}</h2>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Customer: {order.shippingAddress.fullName}</p>
                  <p>Email: {order.email}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order._id, e.target.value as OrderStatus)}
                    className="input w-44 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <button
                    className="ghost-btn text-sm dark:text-gray-400 dark:hover:bg-slate-700"
                    onClick={() => { setSelectedOrder(order); setModalOpen(true); }}
                  >
                    View details
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400">
                <div className="surface rounded-lg p-3 dark:bg-slate-900 dark:border-slate-700">
                  <p className="font-semibold text-gray-900 dark:text-white">Items</p>
                  <p>{order.orderItems.length}</p>
                </div>
                <div className="surface rounded-lg p-3 dark:bg-slate-900 dark:border-slate-700">
                  <p className="font-semibold text-gray-900 dark:text-white">Total</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onStatusChange={updateOrderStatus}
      />
    </AdminGuard>
  )
}
