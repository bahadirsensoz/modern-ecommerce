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
                const res = await fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
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
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
            {status === 'verifying' && <p>Verifying...</p>}
            {status === 'success' && <p className="text-green-600">{message}</p>}
            {status === 'error' && <p className="text-red-600">{message}</p>}
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    )
}
