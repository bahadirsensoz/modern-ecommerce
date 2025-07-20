'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites`, {
                    headers: { Authorization: `Bearer ${token}` },
                })

                const data = await res.json()

                setFavorites(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error('Error fetching favorites:', error)
                setFavorites([])
            } finally {
                setLoading(false)
            }
        }

        fetchFavorites()
    }, [])

    if (loading) {
        return <p className="p-6 font-bold">Loading favorites...</p>
    }

    return (
        <div className="min-h-screen bg-yellow-100 py-12 px-4 sm:px-8 lg:px-16">
            <h1 className="text-4xl font-black mb-8">Your Favorites ❤️</h1>
            {favorites.length === 0 ? (
                <p className="text-lg font-bold text-gray-700">No favorites yet.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((product) =>
                        product._id ? (
                            <ProductCard key={product._id} product={product} />
                        ) : null
                    )}
                </div>
            )}
        </div>
    )
}
