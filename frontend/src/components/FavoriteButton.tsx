'use client'

import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

interface Props {
    productId: string
    initialIsFavorite?: boolean
    variant?: 'card' | 'detail'
}

export default function FavoriteButton({ productId, initialIsFavorite, variant = 'card' }: Props) {
    const [isFavorite, setIsFavorite] = useState<boolean>(false)

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            const token = localStorage.getItem('token')
            if (!token || initialIsFavorite !== undefined) {
                setIsFavorite(!!initialIsFavorite)
                return
            }

            const res = await fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })

            const user = await res.json()
            setIsFavorite(user.favorites?.includes(productId))
        }

        fetchFavoriteStatus()
    }, [productId, initialIsFavorite])

    const toggleFavorite = async () => {
        const token = localStorage.getItem('token')
        if (!token) return alert('Please login to favorite products.')

        const res = await fetch('http://localhost:5000/api/users/me/favorites', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId })
        })

        if (res.ok) {
            setIsFavorite(prev => !prev)
        }
    }

    const buttonClass = variant === 'card'
        ? 'absolute top-2 right-2 z-10 text-red-500 text-xl bg-white rounded-full p-2 shadow border-2 border-black'
        : 'text-red-500 text-2xl bg-white rounded-full p-2 border-2 border-black hover:scale-110 transition'

    return (
        <button
            onClick={(e) => {
                toggleFavorite()
                e.stopPropagation()
            }}
            className={buttonClass}
        >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
    )
}
