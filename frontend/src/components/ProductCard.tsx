'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import FavoriteButton from './FavoriteButton'
import { FaStar } from 'react-icons/fa'

interface ProductCardProps {
  product: Product
  categories?: Category[]
  viewMode?: 'grid' | 'list'
}

export default function ProductCard({ product, categories, viewMode = 'grid' }: ProductCardProps) {
  const router = useRouter()
  const firstImage = product.images?.[0] || '/placeholder.jpg'
  const categoryName = categories ? getCategoryName(product.category, categories) : null

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => router.push(`/product/${product._id}`)}
        className="card cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:gap-6">
          <div className="relative h-56 w-full overflow-hidden rounded-lg border border-gray-200 md:h-48 md:w-48">
            {firstImage ? (
              <Image
                src={firstImage}
                alt={product.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                No image
              </div>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="pill mb-2 inline-flex max-w-[220px] truncate text-xs">
                  {categoryName || 'Product'}
                </p>
                <h3 className="text-xl font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
              </div>
              <p className="rounded-lg bg-gray-100 px-3 py-2 text-lg font-semibold text-gray-900">
                ${product.price}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1 text-amber-500">
                <FaStar className="h-4 w-4" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-gray-400">•</span>
              <span>{product.reviews?.length || 0} reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="pill">View details</span>
              <span className="pill">Add to cart</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => router.push(`/product/${product._id}`)}
      className="group card relative h-full cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-slate-800 dark:border-slate-700"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent" />
        <FavoriteButton productId={product._id} variant="card" />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
          <p className="rounded-lg bg-gray-100 px-3 py-1 text-lg font-semibold text-gray-900">
            ${product.price}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {categoryName && (
              <span className="pill whitespace-normal h-auto text-left px-2.5 py-1 text-xs font-semibold">
                {categoryName}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1 text-amber-500">
            <FaStar className="h-4 w-4" />
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-gray-400">({product.reviews?.length || 0})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
