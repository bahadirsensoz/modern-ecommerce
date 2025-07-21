'use client'

import AdminGuard from '@/components/guards/AdminGuard'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
    const router = useRouter()

    return (
        <AdminGuard>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-5xl font-black mb-8 transform -rotate-2">ADMIN PANEL</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="p-8 bg-blue-400 border-4 border-black text-white font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        🛒 MANAGE PRODUCTS
                    </button>
                    <button
                        onClick={() => router.push('/admin/categories')}
                        className="p-8 bg-yellow-300 border-4 border-black font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        📂 MANAGE CATEGORIES
                    </button>
                    <button
                        onClick={() => router.push('/admin/orders')}
                        className="p-8 bg-green-400 border-4 border-black text-white font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        📦 MANAGE ORDERS
                    </button>
                    <button
                        onClick={() => router.push('/admin/reviews')}
                        className="p-8 bg-pink-400 border-4 border-black text-white font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        ⭐ REVIEW APPROVALS
                    </button>
                    <button
                        onClick={() => router.push('/admin/newsletter')}
                        className="p-8 bg-purple-400 border-4 border-black text-white font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        📧 NEWSLETTER
                    </button>
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-8 bg-red-400 border-4 border-black text-white font-black text-2xl hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 transform hover:-translate-y-1"
                    >
                        📊 DASHBOARD
                    </button>
                </div>
            </div>
        </AdminGuard>
    )
}
