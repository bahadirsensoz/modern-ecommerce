'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

interface RecentlyViewedProps {
    categories: Category[]
}

export default function RecentlyViewed({ categories }: RecentlyViewedProps) {
    const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const { isAuthenticated, token, user } = useAuthStore()
    const { sessionId } = useCartStore()

    useEffect(() => {
        const fetchRecentlyViewed = async () => {
            try {
                setLoading(true)
                const params = new URLSearchParams()

                if (isAuthenticated && user) {
                    params.append('userId', user._id)
                } else if (sessionId) {
                    params.append('sessionId', sessionId)
                } else {
                    setLoading(false)
                    return
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/recently-viewed?${params}&limit=4`)
                if (response.ok) {
                    const data = await response.json()
                    setRecentlyViewed(data)
                }
            } catch (error) {
                console.error('Failed to fetch recently viewed products:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRecentlyViewed()
    }, [isAuthenticated, user, sessionId])

    if (loading) {
        return (
            <div className="bg-green-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black mb-8 transform -rotate-2">👁️ RECENTLY VIEWED</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white border-4 border-black animate-pulse">
                            <div className="aspect-[4/3] bg-gray-200"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (recentlyViewed.length === 0) {
        return null
    }

    return (
        <div className="bg-green-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-8 transform -rotate-2">👁️ RECENTLY VIEWED</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentlyViewed.map(product => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        categories={categories}
                    />
                ))}
            </div>
        </div>
    )
} 