'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const onSubmit = async (data: FormData) => {
        setMessage('')
        setError('')

        const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        const result = await res.json()

        if (res.ok) {
            setMessage('Reset link sent to your email.')
        } else {
            setError(result.message || 'Something went wrong.')
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <input
                    type="email"
                    placeholder="Enter your email"
                    className="input"
                    {...register('email')}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                )}

                <button type="submit" className="btn w-full">
                    Send Reset Link
                </button>

                {message && <p className="text-sm text-green-600">{message}</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
        </div>
    )
}
