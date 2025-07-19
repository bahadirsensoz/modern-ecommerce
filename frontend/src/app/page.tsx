'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import { matchCategory } from '@/utils/matchCategory'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const fetchProducts = async () => {
    const res = await fetch('http://localhost:5000/api/products')
    const data = await res.json()
    setProducts(data)
  }

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories')
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const recommended = products.slice(0, 4)
  const spotlight = products.reduce((max, p) => p.price > max.price ? p : max, products[0] || {} as Product)

  const filteredProducts = selectedCategory
    ? products.filter(p => matchCategory(p, selectedCategory))
    : products

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  return (
    <div className="min-h-screen bg-yellow-200">
      {/* Hero Section */}
      <section className="bg-black text-white py-16 border-b-8 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 -rotate-12"></div>
          <h1 className="text-6xl font-black mb-4 transform -rotate-2">MYSHOP</h1>
          <p className="text-2xl font-bold bg-red-500 inline-block p-2 transform rotate-1">
            Discover amazing products at great prices
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Spotlight Section */}
        {spotlight && spotlight._id && (
          <section
            onClick={() => handleProductClick(spotlight._id)}
            className="bg-gray-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
          >
            <div className="p-8">
              <h2 className="text-4xl font-black mb-6 flex items-center gap-2 transform -rotate-1">
                <span className="text-5xl">🔥</span> SPOTLIGHT
              </h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                {spotlight.image && (
                  <img
                    src={spotlight.image}
                    alt={spotlight.name}
                    className="w-64 h-64 object-cover border-4 border-black transform rotate-2 hover:rotate-0 transition-all"
                  />
                )}
                <div className="flex-1 bg-green-300 p-6 border-4 border-black transform -rotate-1">
                  <h3 className="text-3xl font-black mb-2">{spotlight.name}</h3>
                  <p className="text-4xl font-black text-red-600 mb-3 bg-yellow-300 inline-block p-2">
                    ₺{spotlight.price}
                  </p>
                  <p className="inline-block bg-blue-400 px-4 py-2 font-bold text-white border-2 border-black">
                    {getCategoryName(spotlight.category, categories)}
                  </p>
                  <p className="mt-4 text-lg font-bold">{spotlight.description}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter */}
        <section className="bg-pink-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-black transform -rotate-2">BROWSE PRODUCTS</h2>
            <select
              className="w-full sm:w-64 px-4 py-2 bg-white border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">ALL CATEGORIES</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product._id}
                product={product}
                categories={categories}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}