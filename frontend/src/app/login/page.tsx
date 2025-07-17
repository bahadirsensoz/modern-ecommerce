'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        const data = await res.json()

        if (res.ok) {
            localStorage.setItem('token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            if (data.user.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/')
            }
        } else {
            setMessage(data.message || 'Login failed')
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Login</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    type="email"
                    className="input"
                    required
                />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    type="password"
                    className="input"
                    required
                />

                <button type="submit" className="btn w-full">
                    Login
                </button>

                {message && (
                    <p className="mt-2 text-sm text-red-500">{message}</p>
                )}

                <div className="mt-2 text-right">
                    <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                        Forgot password?
                    </Link>
                </div>
            </form>
        </div>
    )
}
