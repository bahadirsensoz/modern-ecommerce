'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

interface AuthGuardProps {
    children: React.ReactNode
    requireAdmin?: boolean
}

export default function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
    const router = useRouter()
    const { user, isAuthenticated, checkAuth } = useAuthStore()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const verifyAuth = async () => {
            if (!isAuthenticated) {
                await checkAuth()
                if (!isAuthenticated) {
                    router.push('/login')
                    return
                }
            }

            if (requireAdmin && user?.role !== 'admin') {
                router.push('/')
                return
            }

            setAuthorized(true)
        }

        verifyAuth()
    }, [isAuthenticated, user, checkAuth, router, requireAdmin])

    if (!authorized) {
        return <div>Loading...</div>
    }

    return <>{children}</>
}