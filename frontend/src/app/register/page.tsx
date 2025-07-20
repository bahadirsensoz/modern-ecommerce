'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const router = useRouter()

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setMessage('')

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            const json = await res.json()

            if (!res.ok) throw new Error(json.message || 'Registration failed')

            localStorage.setItem('token', json.token)
            window.dispatchEvent(new Event('auth-change'))

            router.push('/')
        } catch (err: any) {
            setMessage(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-8">
                    <h1 className="text-4xl font-black mb-6 transform -rotate-2">REGISTER</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <input
                            {...register('firstName')}
                            placeholder="FIRST NAME"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                        />
                        {errors.firstName && (
                            <p className="text-red-500 font-bold">{errors.firstName.message}</p>
                        )}

                        <input
                            {...register('lastName')}
                            placeholder="LAST NAME"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                        />
                        {errors.lastName && (
                            <p className="text-red-500 font-bold">{errors.lastName.message}</p>
                        )}

                        <input
                            {...register('email')}
                            placeholder="EMAIL"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                        />
                        {errors.email && (
                            <p className="text-red-500 font-bold">{errors.email.message}</p>
                        )}

                        <input
                            {...register('password')}
                            placeholder="PASSWORD"
                            type="password"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                        />
                        {errors.password && (
                            <p className="text-red-500 font-bold">{errors.password.message}</p>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full p-3 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50"
                        >
                            {loading ? 'REGISTERING...' : 'REGISTER'}
                        </button>

                        {message && (
                            <p className="p-3 bg-red-500 text-white font-bold border-4 border-black">
                                {message}
                            </p>
                        )}

                        <div className="pt-4 text-center">
                            <Link
                                href="/login"
                                className="font-bold hover:underline"
                            >
                                ALREADY HAVE AN ACCOUNT? LOGIN
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
