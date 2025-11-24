'use client'

import { useEffect, useState } from 'react'
import { Product, Category } from '@/types'
import { matchCategory } from '@/utils/matchCategory'
import { useRouter } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import NewsletterSignup from '@/components/NewsletterSignup'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'

const ITEMS_PER_PAGE = 9

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

  const { isAuthenticated, token } = useAuthStore()

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
  }, [isAuthenticated, token])

  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const popularProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  const filteredAndSortedProducts = products
    .filter((p) => {
      const matchesCategory = !selectedCategory || matchCategory(p, selectedCategory)
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      const matchesPrice =
        (!priceRange.min || p.price >= Number(priceRange.min)) &&
        (!priceRange.max || p.price <= Number(priceRange.max))
      return matchesCategory && matchesSearch && matchesPrice
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredAndSortedProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPage(1)
    setTimeout(() => {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <div className="page-shell space-y-12">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-6">
          <p className="pill w-fit">Curated for everyday living</p>
          <h1 className="text-4xl font-semibold text-gray-900 sm:text-5xl lg:text-6xl">
            Elevated essentials for modern spaces.
          </h1>
          <p className="max-w-2xl text-lg text-gray-700">
            Thoughtfully designed pieces with premium materials, neutral palettes, and timeless lines.
            Built to last, easy to style, and ready to ship.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="primary-btn"
            >
              Shop the collection
            </button>
            <button
              onClick={() => document.getElementById('new-arrivals')?.scrollIntoView({ behavior: 'smooth' })}
              className="ghost-btn"
            >
              New this week
            </button>
          </div>
          <div className="surface grid gap-4 rounded-xl p-4 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Fast dispatch</p>
              <p className="text-gray-900 font-semibold">Ships in 24-48h from local hubs</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Free & easy returns</p>
              <p className="text-gray-900 font-semibold">30-day returns on all items</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Support that answers</p>
              <p className="text-gray-900 font-semibold">Live chat & email, 7 days a week</p>
            </div>
          </div>
        </div>

        <div className="section relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,139,30,0.14),transparent_45%)]" />
          <div className="relative space-y-5">
            <p className="pill w-fit">Editors&apos; pick</p>
            <div className="space-y-3">
              <h3 className="headline">Pieces with personality.</h3>
              <p className="subtle">
                Layerable neutrals, tactile fabrics, and thoughtful hardware. Made to mix, made to move.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {newArrivals.slice(0, 2).map((item) => (
                <button
                  key={item._id}
                  onClick={() => router.push(`/product/${item._id}`)}
                  className="surface group relative overflow-hidden rounded-xl p-3 text-left transition"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                    <Image
                      src={item.images?.[0] || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-500">{item.category?.name || 'Collection'}</p>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-700">${item.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="new-arrivals" className="section space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pill w-fit">Fresh drops</p>
            <h2 className="headline">New arrivals</h2>
          </div>
          <button
            onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="ghost-btn"
          >
            View all
          </button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {newArrivals.map((product) => (
            <ProductCard key={product._id} product={product} categories={categories} />
          ))}
        </div>
      </section>

      <section className="section space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pill w-fit">Community favorites</p>
            <h2 className="headline">Popular picks</h2>
          </div>
          <span className="subtle text-sm">
            Sorted by rating and repeat purchases
          </span>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {popularProducts.map((product) => (
            <ProductCard key={product._id} product={product} categories={categories} />
          ))}
        </div>
      </section>

      <section id="categories" className="section space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="pill w-fit">Shop by category</p>
            <h2 className="headline">Find your vibe</h2>
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory('')}
              className="ghost-btn text-sm"
            >
              Clear selection
            </button>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              className={`surface relative overflow-hidden rounded-2xl border border-gray-200 p-4 text-left transition ${
                selectedCategory === category._id ? 'ring-2 ring-orange-300' : ''
              }`}
            >
              <div className="relative mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Category</p>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="products-section" className="section space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setPage(1)
            }}
            className="input w-full sm:w-48"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory('')
                setPage(1)
              }}
              className="ghost-btn text-sm"
            >
              Clear category
            </button>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Sort By</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Best Rated</option>
            <option value="newest">Newest</option>
          </select>
          <div className="flex w-full flex-1 flex-wrap gap-2 sm:w-auto">
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
              className="input sm:w-24"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
              className="input sm:w-24"
            />
          </div>
          <button
            onClick={() => setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))}
            className="ghost-btn"
          >
            {viewMode === 'grid' ? 'Switch to list' : 'Switch to grid'}
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="pill">
            {filteredAndSortedProducts.length} items
          </span>
          {selectedCategory && (
            <button
              onClick={() => {
                setSelectedCategory('')
                setPage(1)
              }}
              className="pill hover:border-gray-300"
            >
              Filtered by category · Clear
            </button>
          )}
        </div>

        <div className={viewMode === 'grid'
          ? 'grid gap-6 md:grid-cols-2 xl:grid-cols-3'
          : 'space-y-4'
        }>
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              categories={categories}
              viewMode={viewMode}
            />
          ))}
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-10 w-10 rounded-xl border text-sm font-semibold transition ${page === i + 1
                ? 'border-orange-200 bg-orange-50 text-orange-700'
                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      <section className="pb-10">
        <NewsletterSignup />
      </section>
    </div>
  )
}
