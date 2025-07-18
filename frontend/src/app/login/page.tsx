'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                window.dispatchEvent(new Event('auth-change'))

                if (data.user.role === 'admin') {
                    router.push('/admin')
                } else {
                    router.push('/')
                }
            } else {
                setMessage(data.message || 'Login failed')
            }
        } catch (error) {
            setMessage('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-pink-200 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8">
                    <h1 className="text-4xl font-black mb-6 transform -rotate-2">LOGIN</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="EMAIL"
                            type="email"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                            required
                        />
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="PASSWORD"
                            type="password"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full p-3 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'LOGGING IN...' : 'LOGIN'}
                        </button>

                        {message && (
                            <p className="p-3 bg-red-500 text-white font-bold border-4 border-black">
                                {message}
                            </p>
                        )}

                        <div className="pt-4 flex justify-between items-center">
                            <Link
                                href="/register"
                                className="font-bold hover:underline"
                            >
                                CREATE ACCOUNT
                            </Link>
                            <Link
                                href="/forgot-password"
                                className="font-bold hover:underline"
                            >
                                FORGOT PASSWORD?
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
