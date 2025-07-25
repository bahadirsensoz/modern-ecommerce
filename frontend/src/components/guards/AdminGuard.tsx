'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()
    const { isAuthenticated, user, checkAuth } = useAuthStore()

    useEffect(() => {
        const verifyAuth = async () => {
            if (!isAuthenticated) {
                await checkAuth()
                if (!isAuthenticated) {
                    router.push('/login')
                    return
                }
            }

            if (user?.role !== 'admin') {
                router.push('/')
                return
            }

            setAuthorized(true)
        }

        verifyAuth()
    }, [isAuthenticated, user, checkAuth, router])

    if (!authorized) return null

    return <>{children}</>
}
