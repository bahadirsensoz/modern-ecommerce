'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { User } from '@/types'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isAuthenticated, user: authUser, checkAuth } = useAuthStore()

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        await checkAuth()
        if (!isAuthenticated) {
          router.push('/login')
          return
        }
      }

      if (authUser) {
        setUser(authUser)
        setLoading(false)
      }
    }

    fetchUser()
  }, [isAuthenticated, authUser, checkAuth, router])

  if (loading) return <p className="p-4">Loading...</p>
  if (!user) return <p className="p-4 text-red-500">Failed to load user data.</p>

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="pill">Welcome back</p>
          <h1 className="headline">Account overview</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/dashboard/edit-profile')} className="ghost-btn text-sm">
            Edit profile
          </button>
          <button onClick={() => router.push('/dashboard/change-password')} className="ghost-btn text-sm">
            Change password
          </button>
          <button onClick={() => router.push('/dashboard/addresses')} className="primary-btn text-sm">
            Addresses
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="section space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="surface rounded-lg p-3">
              <p className="font-semibold text-gray-900">Name</p>
              <p>{user.firstName} {user.lastName}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="font-semibold text-gray-900">Email</p>
              <p>{user.email}</p>
            </div>
            <div className="surface rounded-lg p-3">
              <p className="font-semibold text-gray-900">Phone</p>
              <p>{user.phone || '-'}</p>
            </div>
          </div>
        </div>

        <div className="section space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Quick actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={() => router.push('/orders')} className="surface rounded-lg p-4 text-left font-semibold text-gray-900 hover:border-gray-300 hover:bg-gray-50">
              View orders
            </button>
            <button onClick={() => router.push('/favorites')} className="surface rounded-lg p-4 text-left font-semibold text-gray-900 hover:border-gray-300 hover:bg-gray-50">
              Favorites
            </button>
            <button onClick={() => router.push('/dashboard/addresses')} className="surface rounded-lg p-4 text-left font-semibold text-gray-900 hover:border-gray-300 hover:bg-gray-50">
              Manage addresses
            </button>
            <button onClick={() => router.push('/checkout')} className="surface rounded-lg p-4 text-left font-semibold text-gray-900 hover:border-gray-300 hover:bg-gray-50">
              Checkout
            </button>
          </div>
        </div>
      </div>

      <div className="section space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Saved addresses</h2>
          <button onClick={() => router.push('/dashboard/addresses')} className="ghost-btn text-sm">Manage</button>
        </div>
        {user.addresses && user.addresses.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {user.addresses.map((addr, idx) => (
              <div key={idx} className="surface rounded-lg p-3 text-sm text-gray-700 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">
                    {addr.label || `Address ${idx + 1}`}
                  </span>
                  {addr.isDefault && (
                    <span className="pill text-xs">Default</span>
                  )}
                </div>
                <p>{addr.street}</p>
                <p>{addr.city}, {addr.country} {addr.postalCode}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No addresses saved.</p>
        )}
      </div>
    </div>
  )
}
