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

  const layout = (stateLabel: string, body: React.ReactNode) => (
    <div className="section space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="headline">Related products</h2>
        <span className="pill text-xs">{stateLabel}</span>
      </div>
      {body}
    </div>
  )

  if (loading) {
    return layout(
      'Loading',
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="surface animate-pulse rounded-2xl p-4">
            <div className="aspect-[4/3] rounded-xl bg-white/5" />
            <div className="mt-3 space-y-2">
              <div className="h-4 rounded bg-white/5" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return layout('Error', <p className="text-rose-200">{error}</p>)
  }

  if (relatedProducts.length === 0) {
    return layout('No matches', <p className="subtle">No related products found.</p>)
  }

  return (
    <div className="section space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="headline">Related products</h2>
        <button
          onClick={() => router.push('/')}
          className="ghost-btn text-sm"
        >
          Browse all
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
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
