'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import { matchCategory } from '@/utils/matchCategory'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 9


  const fetchProducts = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
    const data = await res.json()
    setProducts(data)
  }

  const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
    const data = await res.json()
    setCategories(data)
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const popularProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(p => {
      const matchesCategory = !selectedCategory || matchCategory(p, selectedCategory)
      const matchesSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesPrice = (!priceRange.min || p.price >= Number(priceRange.min)) &&
        (!priceRange.max || p.price <= Number(priceRange.max))
      return matchesCategory && matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price
        case 'price-desc': return b.price - a.price
        case 'rating': return b.rating - a.rating
        case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default: return 0
      }
    })

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }



  return (
    <div className="min-h-screen bg-yellow-200">
      {/* Hero Section */}
      <section className="bg-black text-white py-24 border-b-8 border-red-500 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-7xl font-black mb-6 transform -rotate-2">
            WELCOME TO MYSHOP
          </h1>
          <p className="text-3xl font-bold bg-red-500 inline-block p-3 transform rotate-1 mb-8">
            Discover amazing products at great prices
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-500 text-white px-6 py-3 text-xl font-black border-4 border-white hover:transform hover:-rotate-2 transition-all"
            >
              NEW ARRIVALS
            </button>
            <button
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-500 text-white px-6 py-3 text-xl font-black border-4 border-white hover:transform hover:rotate-2 transition-all"
            >
              BROWSE CATEGORIES
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 -rotate-12 transform translate-x-24 -translate-y-24"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* New Arrivals Section */}
        <section id="new-arrivals" className="bg-blue-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-8 transform -rotate-2">🆕 NEW ARRIVALS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map(product => (
              <ProductCard key={product._id} product={product} categories={categories} />
            ))}
          </div>
        </section>

        {/* Popular Products Section */}
        <section className="bg-green-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-8 transform -rotate-2">🔥 POPULAR NOW</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map(product => (
              <ProductCard key={product._id} product={product} categories={categories} />
            ))}
          </div>
        </section>

        {/* Categories Grid Section */}
        <section id="categories" className="bg-blue-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-8 transform -rotate-2">SHOP BY CATEGORY</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category._id}
                onClick={() => handleCategoryClick(category._id)}
                className="bg-white border-4 border-black p-4 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="relative w-full aspect-square mb-4 border-2 border-black">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>
                <h3 className="font-black text-xl text-center transform -rotate-1">
                  {category.name.toUpperCase()}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* Products Section with Filtering */}
        <section id="products-section" className="bg-pink-200 p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 p-3 border-4 border-black font-bold"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-3 border-4 border-black font-bold bg-white"
              >
                <option value="">Sort By</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
                <option value="newest">Newest</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-24 p-3 border-4 border-black font-bold"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-24 p-3 border-4 border-black font-bold"
                />
              </div>
              <button
                onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                className="p-3 bg-blue-400 text-white border-4 border-black font-bold"
              >
                {viewMode === 'grid' ? '📝 List View' : '📱 Grid View'}
              </button>
            </div>

            {/* Products Grid/List */}
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-4"
            }>
              {paginatedProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  categories={categories}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 font-bold border-2 border-black ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <NewsletterSignup />
          </div>
        </section>
      </div>
    </div>
  )
}