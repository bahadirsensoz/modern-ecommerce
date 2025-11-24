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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
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
    <div className="page-shell flex items-center justify-center">
      <div className="section w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <p className="pill mx-auto w-fit">Reset access</p>
          <h1 className="headline">Forgot password</h1>
          <p className="subtle">We will email you a secure link to create a new password.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="input"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-rose-200">{errors.email.message}</p>
          )}

          <button type="submit" className="primary-btn w-full justify-center">
            Send reset link
          </button>

          {message && <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">{message}</p>}
          {error && <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">{error}</p>}
        </form>
      </div>
    </div>
  )
}
