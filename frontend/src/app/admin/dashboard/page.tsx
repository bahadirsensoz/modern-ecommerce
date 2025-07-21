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

        if (!isValidJWT(token)) {
            console.error('Invalid JWT token in AdminDashboard')
            return
        }

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

    if (loading) {
        return (
            <AdminGuard>
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-5xl font-black mb-8 transform -rotate-2">ADMIN DASHBOARD</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white border-4 border-black p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </AdminGuard>
        )
    }

    return (
        <AdminGuard>
            <div className="p-6 max-w-7xl mx-auto">
                <h1 className="text-5xl font-black mb-8 transform -rotate-2">ADMIN DASHBOARD</h1>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-blue-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-lg font-black mb-2">TOTAL SALES</h3>
                        <p className="text-3xl font-black">₺{stats?.totalSales?.toLocaleString() || '0'}</p>
                    </div>
                    <div className="bg-green-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-lg font-black mb-2">TOTAL ORDERS</h3>
                        <p className="text-3xl font-black">{stats?.totalOrders || '0'}</p>
                    </div>
                    <div className="bg-yellow-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-lg font-black mb-2">TOTAL CUSTOMERS</h3>
                        <p className="text-3xl font-black">{stats?.totalCustomers || '0'}</p>
                    </div>
                    <div className="bg-pink-400 border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="text-lg font-black mb-2">TOTAL PRODUCTS</h3>
                        <p className="text-3xl font-black">{stats?.totalProducts || '0'}</p>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6">ORDER STATUS DISTRIBUTION</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="bg-yellow-400 border-2 border-black p-4 mb-2">
                                <p className="text-2xl font-black">{stats?.orderStatusDistribution?.pending || 0}</p>
                            </div>
                            <p className="font-black">PENDING</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-blue-400 border-2 border-black p-4 mb-2">
                                <p className="text-2xl font-black">{stats?.orderStatusDistribution?.processing || 0}</p>
                            </div>
                            <p className="font-black">PROCESSING</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-400 border-2 border-black p-4 mb-2">
                                <p className="text-2xl font-black">{stats?.orderStatusDistribution?.shipped || 0}</p>
                            </div>
                            <p className="font-black">SHIPPED</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-400 border-2 border-black p-4 mb-2">
                                <p className="text-2xl font-black">{stats?.orderStatusDistribution?.delivered || 0}</p>
                            </div>
                            <p className="font-black">DELIVERED</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-400 border-2 border-black p-4 mb-2">
                                <p className="text-2xl font-black">{stats?.orderStatusDistribution?.cancelled || 0}</p>
                            </div>
                            <p className="font-black">CANCELLED</p>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6">RECENT ORDERS</h2>
                    <div className="space-y-4">
                        {stats?.recentOrders?.slice(0, 5).map((order: Order) => (
                            <div key={order._id} className="bg-gray-100 border-2 border-black p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-black">Order #{order._id.slice(-6)}</p>
                                        <p className="text-sm">{order.email}</p>
                                        <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-lg">₺{order.totalPrice}</p>
                                        <span className={`px-2 py-1 text-xs font-black border-2 border-black ${order.status === 'delivered' ? 'bg-green-400' :
                                            order.status === 'shipped' ? 'bg-purple-400' :
                                                order.status === 'processing' ? 'bg-blue-400' :
                                                    order.status === 'cancelled' ? 'bg-red-400' :
                                                        'bg-yellow-400'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Products */}
                <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-2xl font-black mb-6">POPULAR PRODUCTS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {stats?.popularProducts?.slice(0, 6).map((product: Product) => (
                            <div key={product._id} className="bg-gray-100 border-2 border-black p-4">
                                <h3 className="font-black mb-2">{product.name}</h3>
                                <p className="text-sm mb-2">₺{product.price}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-500">{'⭐'.repeat(Math.round(product.rating))}</span>
                                    <span className="text-sm font-bold">({product.reviews?.length || 0} reviews)</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminGuard>
    )
} 