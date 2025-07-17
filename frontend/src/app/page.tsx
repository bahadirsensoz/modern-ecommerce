'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import { matchCategory } from '@/utils/matchCategory'

export default function HomePage() {
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

  return (
    <div className="p-8 space-y-12">
      {/* Spotlight */}
      {spotlight && spotlight._id && (
        <section className="bg-yellow-50 p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4">🌟 Spotlight Product</h2>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {spotlight.image && (
              <img src={spotlight.image} alt={spotlight.name} className="w-48 h-48 object-cover rounded" />
            )}
            <div>
              <h3 className="text-xl font-semibold">{spotlight.name}</h3>
              <p className="text-gray-600">₺{spotlight.price}</p>
              <p className="text-sm text-gray-500 mt-1">
                {getCategoryName(spotlight.category, categories)}
              </p>
              <p className="mt-2 text-gray-700">{spotlight.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Recommended */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🔥 Recommended Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {recommended.map(product => (
            <div key={product._id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">₺{product.price}</p>
              <p className="text-sm text-gray-500">{getCategoryName(product.category, categories)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter + All Products */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🛒 All Products</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Filter by Category</label>
          <select
            className="border bg-white text-black p-2 rounded w-full sm:w-60"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product._id} className="border rounded-lg p-4 shadow hover:shadow-md transition">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover rounded mb-4"
                />
              )}
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">₺{product.price}</p>
              <p className="text-sm text-gray-500">{getCategoryName(product.category, categories)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
