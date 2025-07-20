'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'
import { useCartStore } from '@/store/cartStore'


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
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isHydrated, setIsHydrated] = useState(false)
    const { items, setCart } = useCartStore()

    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0)

    const checkAuthAndCart = async () => {
        const token = localStorage.getItem('token')
        setLoading(true)

        try {
            if (!token) {
                const guestCart = safeJSONParse(localStorage.getItem('cart'), [])
                setCart(guestCart)
                setIsLoggedIn(false)
                setIsAdmin(false)
                setLoading(false)
                return
            }

            const authRes = await fetch('http://localhost:5000/api/users/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (!authRes.ok) {
                throw new Error('Authentication failed')
            }

            const user = await authRes.json()
            setIsLoggedIn(true)
            setIsAdmin(user.role === 'admin')

            try {
                const cartRes = await fetch('http://localhost:5000/api/cart', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                })

                if (cartRes.ok) {
                    const cartData = await cartRes.json()
                    const cartItems = cartData.items?.map((item: any) => ({
                        productId: item.product._id,
                        name: item.product.name,
                        price: item.product.price,
                        image: item.product.images?.[0] || '/placeholder.jpg',
                        quantity: item.quantity
                    })) || []
                    setCart(cartItems)
                }
            } catch (cartError) {
                console.error('Cart fetch failed:', cartError)
                setCart([])
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
            setIsLoggedIn(false)
            setIsAdmin(false)
            setCart([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleAuthChange = () => {
            checkAuthAndCart()
        }

        checkAuthAndCart()

        window.addEventListener('storage', handleAuthChange)
        window.addEventListener('auth-change', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleAuthChange)
            window.removeEventListener('auth-change', handleAuthChange)
        }
    }, [])

    useEffect(() => {
        setIsHydrated(true)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        setIsAdmin(false)
        setShowDropdown(false)
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new Event('auth-change'))
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
                                {isHydrated && totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>

                        {isLoggedIn ? (
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
