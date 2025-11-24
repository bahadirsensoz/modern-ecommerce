'use client'

import { useEffect, useState } from 'react'
import AdminGuard from '@/components/guards/AdminGuard'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'
import { Order, Product } from '@/types'

interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Order[]
  popularProducts: Product[]
  orderStatusDistribution: {
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
  }
  monthlySales: {
    month: string
    sales: number
  }[]
}

export default function AdminDashboardPage() {
  const { isAuthenticated, token } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    logTokenInfo(token, 'AdminDashboard')
    if (!isValidJWT(token)) return

    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [isAuthenticated, token])

  if (loading) return <div className="page-shell text-sm text-gray-600">Loading...</div>

  return (
    <AdminGuard>
      <div className="page-shell space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline">Dashboard</h1>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="section p-4">
            <p className="text-sm text-gray-500">Total sales</p>
            <p className="text-3xl font-semibold text-gray-900">${stats?.totalSales?.toFixed(2) || 0}</p>
          </div>
          <div className="section p-4">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalOrders || 0}</p>
          </div>
          <div className="section p-4">
            <p className="text-sm text-gray-500">Customers</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalCustomers || 0}</p>
          </div>
          <div className="section p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-3xl font-semibold text-gray-900">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="section space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Order status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm text-gray-700">
            <div className="surface rounded-lg p-3">
              <p className="text-xs text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.orderStatusDistribution?.pending || 0}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="text-xs text-gray-500">Processing</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.orderStatusDistribution?.processing || 0}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="text-xs text-gray-500">Shipped</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.orderStatusDistribution?.shipped || 0}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="text-xs text-gray-500">Delivered</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.orderStatusDistribution?.delivered || 0}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="text-xs text-gray-500">Cancelled</p>
              <p className="text-xl font-semibold text-gray-900">{stats?.orderStatusDistribution?.cancelled || 0}</p>
            </div>
          </div>
        </div>

        <div className="section space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent orders</h2>
          <div className="space-y-3">
            {stats?.recentOrders?.slice(0, 5).map((order: Order) => (
              <div key={order._id} className="surface border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</p>
                  <p>{order.email}</p>
                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">${order.totalPrice}</p>
                  <span className="pill text-xs">{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Popular products</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {stats?.popularProducts?.slice(0, 6).map((product: Product) => (
              <div key={product._id} className="surface border border-gray-200 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-gray-600">${product.price}</p>
                <div className="flex items-center gap-2 text-amber-500">
                  <span>★ {product.rating.toFixed(1)}</span>
                  <span className="text-gray-500">({product.reviews?.length || 0})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
