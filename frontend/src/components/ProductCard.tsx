'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import FavoriteButton from './FavoriteButton'

interface ProductCardProps {
    product: Product
    categories?: Category[]
}

export default function ProductCard({ product, categories }: ProductCardProps) {
    const router = useRouter()

    const firstImage = product.images?.[0] || '/placeholder.jpg'
    const categoryName = categories ? getCategoryName(product.category, categories) : null

    return (
        <div
            onClick={() => router.push(`/product/${product._id}`)}
            className="bg-white border-4 border-black hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] cursor-pointer transition-all duration-200"
        >
            <div className="relative">
                <Image
                    src={firstImage}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover border-b-4 border-black"
                />
                <FavoriteButton
                    productId={product._id}
                    className="absolute top-2 right-2 text-2xl bg-white border-2 border-black rounded-full px-2"
                />
            </div>
            <div className="p-4">
                <h3 className="font-black text-xl mb-2">{product.name}</h3>
                <p className="text-red-600 font-black text-2xl bg-yellow-300 inline-block p-1 mb-2">
                    ₺{product.price}
                </p>
                {categoryName && (
                    <p className="text-sm font-bold bg-blue-400 text-white px-2 py-1 inline-block border-2 border-black">
                        {categoryName}
                    </p>
                )}
            </div>
        </div>
    )
}
