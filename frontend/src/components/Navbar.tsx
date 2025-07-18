'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Navbar() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(true)

    const checkAuth = async () => {
        setLoading(true)
        const token = localStorage.getItem('token')

        if (!token) {
            setIsLoggedIn(false)
            setIsAdmin(false)
            setLoading(false)
            return
        }

        try {
            const res = await fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Auth failed')

            const user = await res.json()
            setIsLoggedIn(true)
            setIsAdmin(user.role === 'admin')
        } catch (error) {
            console.error('Auth check failed:', error)
            setIsLoggedIn(false)
            setIsAdmin(false)
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkAuth()

        const handleAuthChange = () => {
            checkAuth()
        }

        window.addEventListener('storage', handleAuthChange)
        window.addEventListener('auth-change', handleAuthChange)

        return () => {
            window.removeEventListener('storage', handleAuthChange)
            window.removeEventListener('auth-change', handleAuthChange)
        }
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

    if (loading) {
        return (
            <nav className="bg-gray-300 border-b-4 border-black sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <h1 className="text-3xl font-black cursor-pointer transform -rotate-2">
                            MYSHOP
                        </h1>
                    </div>
                </div>
            </nav>
        )
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
                        {isLoggedIn ? (
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
                                                router.push(
                                                    isAdmin ? '/admin' : '/dashboard'
                                                )
                                                setShowDropdown(false)
                                            }}
                                            className="block w-full text-left px-4 py-2 text-black font-bold hover:bg-blue-400 hover:text-white border-b-4 border-black"
                                        >
                                            {isAdmin ? 'ADMIN PANEL' : 'DASHBOARD'}
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