'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const [authorized, setAuthorized] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        const fetchMe = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (!res.ok) {
                    router.push('/login')
                    return
                }

                const user = await res.json()

                if (user.role !== 'admin') {
                    router.push('/')
                    return
                }

                setAuthorized(true)
            } catch (err) {
                console.error(err)
                router.push('/login')
            }
        }

        fetchMe()
    }, [router])

    if (!authorized) return null

    return <>{children}</>
}
