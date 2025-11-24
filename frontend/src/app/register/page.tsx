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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.message || 'Registration failed')

      localStorage.setItem('token', json.token)
      window.dispatchEvent(new Event('auth-change'))

      router.push('/')
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="section w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="pill mx-auto w-fit">Join the club</p>
          <h1 className="headline">Create an account</h1>
          <p className="subtle">Save favorites, track orders, and get personalized picks.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register('firstName')}
            placeholder="First name"
            className="input"
          />
          {errors.firstName && (
            <p className="text-sm font-semibold text-rose-200">{errors.firstName.message}</p>
          )}

          <input
            {...register('lastName')}
            placeholder="Last name"
            className="input"
          />
          {errors.lastName && (
            <p className="text-sm font-semibold text-rose-200">{errors.lastName.message}</p>
          )}

          <input
            {...register('email')}
            placeholder="Email"
            className="input"
            type="email"
          />
          {errors.email && (
            <p className="text-sm font-semibold text-rose-200">{errors.email.message}</p>
          )}

          <input
            {...register('password')}
            placeholder="Password"
            type="password"
            className="input"
          />
          {errors.password && (
            <p className="text-sm font-semibold text-rose-200">{errors.password.message}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          {message && (
            <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
              {message}
            </p>
          )}

          <div className="pt-2 text-center text-sm">
            <Link href="/login" className="hover:text-white hover:underline">
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
