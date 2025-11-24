'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

function VerifyEmailContent() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token')
      if (!token) {
        setStatus('error')
        setMessage('Verification token is missing.')
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email?token=${token}`)
        const data = await res.json()

        if (!res.ok) {
          setStatus('error')
          setMessage(data.message || 'Verification failed.')
          return
        }

        setStatus('success')
        setMessage(data.message)
      } catch (error) {
        console.error(error)
        setStatus('error')
        setMessage('Something went wrong.')
      }
    }

    verify()
  }, [searchParams])

  return (
    <div className="page-shell flex items-center justify-center">
      <div className="section w-full max-w-md space-y-4 text-center">
        <p className="pill mx-auto w-fit">Email verification</p>
        <h1 className="headline">Confirming your account</h1>
        {status === 'verifying' && <p className="subtle">Verifying...</p>}
        {status === 'success' && <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-100">{message}</p>}
        {status === 'error' && <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">{message}</p>}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="page-shell text-slate-200">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
