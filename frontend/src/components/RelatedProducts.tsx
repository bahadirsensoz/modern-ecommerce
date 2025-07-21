'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import ProductCard from './ProductCard'
import { useRouter } from 'next/navigation'

interface RelatedProductsProps {
    productId: string
    categories: Category[]
}

export default function RelatedProducts({ productId, categories }: RelatedProductsProps) {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/related/${productId}?limit=4`)

                if (response.ok) {
                    const data = await response.json()
                    setRelatedProducts(data)
                } else {
                    const errorData = await response.json()
                    console.error('API error:', errorData)
                    setError(errorData.message || 'Failed to fetch related products')
                }
            } catch (error) {
                console.error('Failed to fetch related products:', error)
                setError('Network error')
            } finally {
                setLoading(false)
            }
        }

        if (productId) {
            fetchRelatedProducts()
        }
    }, [productId])


    if (loading) {
        return (
            <div className="bg-yellow-500 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black mb-8 transform -rotate-2">🔄 RELATED PRODUCTS</h2>
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

    if (error) {
        return (
            <div className="bg-red-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black mb-8 transform -rotate-2">❌ RELATED PRODUCTS</h2>
                <p className="text-red-800 font-bold">Error: {error}</p>
            </div>
        )
    }

    if (relatedProducts.length === 0) {
        return (
            <div className="bg-gray-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-3xl font-black mb-8 transform -rotate-2">📦 RELATED PRODUCTS</h2>
                <p className="text-gray-600 font-bold">No related products found</p>
            </div>
        )
    }

    return (
        <div className="bg-yellow-500 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-8 transform -rotate-2">🔄 RELATED PRODUCTS</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(product => (
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