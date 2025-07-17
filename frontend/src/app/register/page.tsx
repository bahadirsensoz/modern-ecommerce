'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string(),
    lastName: z.string(),
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
            if (!res.ok) throw new Error(json.message || 'Error')
            setMessage('✅ Registered successfully!')
        } catch (err: any) {
            setMessage(`❌ ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-md mx-auto mt-20 p-4 bg-white shadow rounded">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input {...register('firstName')} placeholder="First name" className="input" />
                {errors.firstName && <p className="text-red-500">{errors.firstName.message}</p>}

                <input {...register('lastName')} placeholder="Last name" className="input" />
                {errors.lastName && <p className="text-red-500">{errors.lastName.message}</p>}

                <input {...register('email')} placeholder="Email" className="input" />
                {errors.email && <p className="text-red-500">{errors.email.message}</p>}

                <input {...register('password')} placeholder="Password" type="password" className="input" />
                {errors.password && <p className="text-red-500">{errors.password.message}</p>}

                <button disabled={loading} type="submit" className="btn w-full">
                    {loading ? 'Registering...' : 'Register'}
                </button>

                {message && <p className="mt-4">{message}</p>}
            </form>
        </div>
    )
}
