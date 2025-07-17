'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        setIsLoggedIn(false)
        router.push('/')
    }

    return (
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
            <h1 onClick={() => router.push('/')} className="text-xl font-bold cursor-pointer">
                MyShop
            </h1>
            <div>
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="text-red-500 hover:underline">
                        Logout
                    </button>
                ) : (
                    <>
                        <button onClick={() => router.push('/login')} className="mr-4 text-blue-600 hover:underline">
                            Login
                        </button>
                        <button onClick={() => router.push('/register')} className="text-blue-600 hover:underline">
                            Register
                        </button>
                    </>
                )}
            </div>
        </nav>
    )
}
