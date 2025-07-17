'use client'

import { useEffect, useState } from 'react'

type Product = {
  _id: string
  name: string
  description?: string
  price: number
  category?: string
  image?: string
}

type Category = {
  _id: string
  name: string
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])

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

  const getCategoryName = (categoryId?: string) => {
    return categories.find((cat) => cat._id === categoryId)?.name || 'Unknown'
  }

  const recommended = products.slice(0, 4)
  const spotlight = products.reduce((max, p) => p.price > max.price ? p : max, products[0] || {} as Product)

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
                {getCategoryName(spotlight.category)}
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
              <p className="text-sm text-gray-500">{getCategoryName(product.category)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section>
        <h2 className="text-2xl font-bold mb-4">🛒 All Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
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
              <p className="text-sm text-gray-500">{getCategoryName(product.category)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
