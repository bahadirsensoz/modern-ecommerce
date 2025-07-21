'use client'

import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { Product } from '@/types'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

interface Props {
    productId: string
    initialIsFavorite?: boolean
    variant?: 'card' | 'detail'
}

export default function FavoriteButton({ productId, initialIsFavorite, variant = 'card' }: Props) {
    const router = useRouter()
    const { user, isAuthenticated, token } = useAuthStore()
    const [isFavorite, setIsFavorite] = useState<boolean>(false)

    useEffect(() => {
        if (isAuthenticated && user?.favorites) {
            const favorites = user.favorites as (string | Product)[]
            const isFav = favorites.some(fav =>
                typeof fav === 'string'
                    ? fav === productId
                    : fav._id === productId
            )
            setIsFavorite(isFav)
        }
    }, [user, productId, isAuthenticated])

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!isAuthenticated) {
            if (confirm('Please login to add favorites. Would you like to login now?')) {
                router.push('/login')
            }
            return
        }

        if (!token) {
            console.error('No token available')
            return
        }

        logTokenInfo(token, 'FavoriteButton')

        if (!isValidJWT(token)) {
            console.error('Invalid JWT token in FavoriteButton')
            return
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ productId })
            })

            if (!res.ok) throw new Error('Failed to toggle favorite')

            const data = await res.json()
            setIsFavorite(prev => !prev)
        } catch (error) {
            console.error('Failed to toggle favorite:', error)
        }
    }

    const buttonClass = variant === 'card'
        ? 'absolute top-2 right-2 z-10 text-red-500 text-xl bg-gray-400 rounded-full p-2 shadow border-2 border-black'
        : 'text-red-500 text-2xl bg-gray-400 rounded-full p-2 border-2 border-black hover:scale-110 transition'

    return (
        <button
            onClick={toggleFavorite}
            className={buttonClass}
        >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
    )
}
