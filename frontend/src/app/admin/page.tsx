'use client'

import AdminGuard from '@/components/guards/AdminGuard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const router = useRouter()

  const cards = [
    { label: 'Manage products', href: '/admin/products' },
    { label: 'Manage categories', href: '/admin/categories' },
    { label: 'Manage orders', href: '/admin/orders' },
    { label: 'Review approvals', href: '/admin/reviews' },
    { label: 'Newsletter', href: '/admin/newsletter' },
    { label: 'Analytics', href: '/admin/dashboard' },
    { label: 'Customers', href: '/admin/customers' },
  ]

  return (
    <AdminGuard>
      <div className="page-shell space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline dark:text-white">Control center</h1>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <button
              key={card.href}
              onClick={() => router.push(card.href)}
              className="section p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">Shortcut</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{card.label}</p>
            </button>
          ))}
          <Link href="/admin/customers" className="section p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Shortcut</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Manage customers</p>
          </Link>
        </div>
      </div>
    </AdminGuard>
  )
}
