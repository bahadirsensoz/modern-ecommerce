'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { CartItem } from '@/types'


function safeJSONParse<T>(raw: string | null, fallback: T): T {
    try {
        return raw ? JSON.parse(raw) : fallback
    } catch (err) {
        console.error('Safe JSON parse failed:', err)
        return fallback
    }
}

export default function Navbar() {
    const router = useRouter()
    const { isAuthenticated, user, logout, checkAuth, token } = useAuthStore()
    const [showDropdown, setShowDropdown] = useState(false)
    const { items, syncCart } = useCartStore()

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)
    const isAdmin = user?.role === 'admin'

    const syncCartWithAuth = async () => {
        try {
            if (!isAuthenticated) {
                await syncCart()
                return
            }

            await syncCart(token || undefined)
        } catch (error) {
            console.error('Cart sync failed:', error)
        }
    }

    useEffect(() => {
        const handleAuthChange = () => {
            syncCartWithAuth()
        }

        syncCartWithAuth()

        window.addEventListener('storage', handleAuthChange)
        window.addEventListener('auth-change', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleAuthChange)
            window.removeEventListener('auth-change', handleAuthChange)
        }
    }, [syncCart, isAuthenticated, token])

    const handleLogout = () => {
        logout()
        setShowDropdown(false)
        router.push('/')
    }

    return (
        <nav className="bg-gray-300 border-b-4 border-black sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <h1
                        onClick={() => router.push('/')}
                        className="text-3xl font-black cursor-pointer transform -rotate-2 hover:rotate-0 transition-all duration-200"
                    >
                        MYSHOP
                    </h1>

                    <div className="flex items-center gap-4">
                        {/* CART ICON FOR EVERYONE */}
                        <div className="relative">
                            <button
                                onClick={() => router.push('/cart')}
                                className="relative text-black text-xl"
                                title="Cart"
                            >
                                <FaShoppingCart />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>

                        {isAuthenticated ? (
                            <>
                                <button
                                    onClick={() => router.push('/favorites')}
                                    className="text-red-500 hover:text-red-700 text-xl"
                                    title="Favorites"
                                >
                                    <FaHeart />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center space-x-2"
                                    >
                                        <div className="w-12 h-12 bg-yellow-300 flex items-center justify-center overflow-hidden border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                                            <Image
                                                src="/default-avatar.png"
                                                alt="Profile"
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        </div>
                                    </button>

                                    {showDropdown && (
                                        <div className="absolute right-0 mt-2 w-48 bg-pink-200 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <button
                                                onClick={() => {
                                                    router.push(isAdmin ? '/admin' : '/dashboard')
                                                    setShowDropdown(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 text-black font-bold hover:bg-blue-400 hover:text-white border-b-4 border-black"
                                            >
                                                {isAdmin ? 'ADMIN PANEL' : 'DASHBOARD'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    router.push('/orders')
                                                    setShowDropdown(false)
                                                }}
                                                className="block w-full text-left px-4 py-2 text-black font-bold hover:bg-green-400 hover:text-white border-b-4 border-black"
                                            >
                                                ORDERS
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-black font-bold hover:bg-red-500 hover:text-white"
                                            >
                                                LOGOUT
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <button
                                    onClick={() => router.push('/login')}
                                    className="px-6 py-2 bg-yellow-300 font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    LOGIN
                                </button>
                                <button
                                    onClick={() => router.push('/register')}
                                    className="px-6 py-2 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    REGISTER
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
