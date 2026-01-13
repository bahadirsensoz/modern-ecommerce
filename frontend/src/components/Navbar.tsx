'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const router = useRouter()
  const { isAuthenticated, user, logout, token } = useAuthStore()
  const { items, syncCart } = useCartStore()
  const [open, setOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollYRef = useRef(0)

  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
  const isAdmin = user?.role === 'admin'

  const syncCartWithAuth = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        await syncCart()
        return
      }
      await syncCart(token || undefined)
    } catch (error) {
      console.error('Cart sync failed:', error)
    }
  }, [isAuthenticated, syncCart, token])

  useEffect(() => {
    const handleAuthChange = () => syncCartWithAuth()
    syncCartWithAuth()

    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [syncCartWithAuth])

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      const isScrollingDown = current > lastScrollYRef.current

      if (current < 80) {
        setIsHidden(false)
      } else if (isScrollingDown) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }

      lastScrollYRef.current = current
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (open && !(e.target as Element).closest('.relative')) {
        setOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  const handleLogout = () => {
    logout()
    setOpen(false)
    router.push('/')
  }

  return (
    <nav className={`sticky top-0 z-50 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur transition-transform duration-200 ${isHidden ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-4 py-3 md:px-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-gray-50"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f68b1e] text-lg font-bold text-white shadow-sm">
            M
          </span>
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Modern Mart</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">MyShop</p>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated && (
            <button
              onClick={() => router.push('/favorites')}
              className="group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
              title="Favorites"
            >
              <FaHeart className="text-[#f68b1e] transition group-hover:scale-110" />
              <span className="hidden sm:inline">Favorites</span>
            </button>
          )}

          <button
            onClick={() => router.push('/cart')}
            className="group relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
            title="Cart"
          >
            <FaShoppingCart className="text-[#f68b1e] transition group-hover:scale-110" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#f68b1e] text-[11px] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-200 dark:hover:bg-slate-700"
              >
                <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-slate-600 dark:bg-slate-700">
                  <Image
                    src="/default-avatar.png"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Hello,</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">
                    {user?.firstName || 'Guest'}
                  </p>
                </div>
              </button>

              {open && (
                <div className="absolute right-0 mt-3 w-56 rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <button
                    onClick={() => {
                      router.push(isAdmin ? '/admin' : '/dashboard')
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 transition hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400"
                  >
                    <span>{isAdmin ? 'Admin Panel' : 'Dashboard'}</span>
                    <span className="pill group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40">Open</span>
                  </button>
                  <button
                    onClick={() => {
                      router.push('/orders')
                      setOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-200 transition hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-400"
                  >
                    <span>Orders</span>
                    <span className="pill group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40">History</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-gray-100"
                  >
                    <span>Logout</span>
                    <span className="pill">Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => router.push('/login')}
                className="ghost-btn"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="primary-btn"
              >
                Create account
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
