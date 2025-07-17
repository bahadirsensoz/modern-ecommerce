'use client'

import AdminGuard from '@/components/guards/AdminGuard'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
    const router = useRouter()

    return (
        <AdminGuard>
            <div className="p-6 max-w-xl mx-auto text-center">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/admin/products')}
                        className="btn text-lg py-3"
                    >
                        🛒 Manage Products
                    </button>
                    <button
                        onClick={() => router.push('/admin/categories')}
                        className="btn text-lg py-3"
                    >
                        📂 Manage Categories
                    </button>
                </div>
            </div>
        </AdminGuard>
    )
}
