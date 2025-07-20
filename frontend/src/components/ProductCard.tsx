'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import FavoriteButton from './FavoriteButton'

interface ProductCardProps {
    product: Product
    categories?: Category[]
    viewMode?: 'grid' | 'list'
}

export default function ProductCard({ product, categories, viewMode = 'grid' }: ProductCardProps) {
    const router = useRouter()
    const firstImage = product.images?.[0]

    if (viewMode === 'list') {
        return (
            <div
                onClick={() => router.push(`/product/${product._id}`)}
                className="bg-white border-4 border-black p-4 cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
                <div className="flex gap-6">
                    <div className="relative w-48 h-48 border-2 border-black flex-shrink-0">
                        {firstImage ? (
                            <Image
                                src={firstImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-4xl">📦</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-xl mb-2">{product.name}</h3>
                        <p className="text-2xl font-black text-red-600 mb-2">₺{product.price}</p>
                        <p className="bg-blue-400 text-white inline-block px-2 py-1 font-bold mb-4">
                            {categories ? getCategoryName(product.category, categories) : ''}
                        </p>
                        <p className="font-bold">{product.description}</p>
                        <div className="mt-4">
                            <span className="text-yellow-500">{'⭐'.repeat(Math.round(product.rating))}</span>
                            <span className="font-bold ml-2">({product.reviews?.length || 0} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const categoryName = categories ? getCategoryName(product.category, categories) : null

    return (
        <div
            onClick={() => router.push(`/product/${product._id}`)}
            className="bg-white border-4 border-black hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] cursor-pointer transition-all duration-200"
        >
            <div className="relative aspect-[4/3] w-full">
                <Image
                    src={firstImage}
                    alt={product.name}
                    fill
                    className="object-cover border-b-4 border-black"
                />
                <FavoriteButton productId={product._id} variant="card" />
            </div>
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-black text-xl">{product.name}</h3>
                    <p className="text-red-600 font-black text-2xl bg-yellow-300 p-1">
                        ₺{product.price}
                    </p>
                </div>
                <div className="flex justify-between items-center">
                    {categoryName && (
                        <p className="text-sm font-bold bg-blue-400 text-white px-2 py-1 border-2 border-black">
                            {categoryName}
                        </p>
                    )}
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">{'⭐'.repeat(Math.round(product.rating))}</span>
                        <span className="text-sm font-bold">({product.reviews?.length || 0})</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
