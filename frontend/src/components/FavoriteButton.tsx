'use client'

import { useState, useEffect } from 'react'

interface FavoriteButtonProps {
    productId: string
    className?: string
}

export default function FavoriteButton({ productId, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        const fetchFavorites = async () => {
            const token = localStorage.getItem('token')
            if (!token) return

            const res = await fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await res.json()
            setIsFavorite(data.favorites?.includes(productId))
        }

        fetchFavorites()
    }, [productId])

    const handleToggle = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        await fetch('http://localhost:5000/api/users/me/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ productId })
        })

        setIsFavorite(prev => !prev)
    }

    return (
        <button
            onClick={e => {
                e.stopPropagation()
                handleToggle()
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl border-2 border-black ${isFavorite ? 'bg-red-400 text-white' : 'bg-white text-gray-400'} ${className}`}
        >
            ♥
        </button>
    )
}
