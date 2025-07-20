'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, Suspense } from 'react'

const schema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

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
        if (!token) {
            setError('Token is missing.')
            return
        }

        const res = await fetch(`http://localhost:5000/api/auth/reset-password?token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: data.password }),
        })

        const result = await res.json()

        if (res.ok) {
            setMessage('Password reset successful. Redirecting to login...')
            setTimeout(() => router.push('/login'), 3000)
        } else {
            setError(result.message || 'Something went wrong.')
        }
    }

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <input
                    type="password"
                    placeholder="New Password"
                    className="input"
                    {...register('password')}
                />
                {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                )}

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="input"
                    {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}

                <button type="submit" className="btn w-full">Reset Password</button>

                {message && <p className="text-sm text-green-600">{message}</p>}
                {error && <p className="text-sm text-red-500">{error}</p>}
            </form>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
}
