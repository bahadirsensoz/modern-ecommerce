'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FavoriteButton from '@/components/FavoriteButton'
import StarRatingInput from '@/components/StarRatingInput'
import RelatedProducts from '@/components/RelatedProducts'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import Image from 'next/image'
import { Product, Review, ApiError, CartItem, Category } from '@/types'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'
import { trackProductView } from '@/utils/activityTracking'
import { getCategoryName } from '@/utils/getCategoryName'

export default function ProductDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { isAuthenticated, token } = useAuthStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({})
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState('')
  const [userId, setUserId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`)
      const data = await res.json()
      setProduct(data)
      trackProductView(data._id, data.category?._id)
    } catch (error) {
      console.error('Failed to fetch product:', error)
    }
  }, [id])

  const fetchUser = useCallback(async () => {
    if (!isAuthenticated || !token) return
    logTokenInfo(token, 'ProductDetail')
    if (!isValidJWT(token)) {
      console.error('Invalid JWT token in ProductDetail')
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      const user = await res.json()
      setUserId(user._id)
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }, [isAuthenticated, token])

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchProduct()
    fetchUser()
    fetchCategories()
  }, [fetchProduct, fetchUser, fetchCategories])

  useEffect(() => {
    if (!product || !userId) return
    const existingReview = product.reviews.find((r) =>
      (typeof r.user === 'string' ? r.user : r.user._id) === userId
    )
    if (existingReview) {
      setComment(existingReview.comment)
      setRating(existingReview.rating)
    }
  }, [product, userId])

  const handleNextImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % (product?.images?.length || 1))
    }
  }

  const handlePrevImage = () => {
    if (product && product.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      if (!isAuthenticated || !token) {
        setMessage('Please login to submit a review')
        return
      }

      logTokenInfo(token, 'ReviewSubmit')
      if (!isValidJWT(token)) {
        setMessage('Authentication error. Please login again.')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ rating: Number(rating), comment })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to submit review')
      }

      const data = await res.json()
      setProduct(data)
      setMessage('Review submitted successfully!')
      setIsEditing(false)
      resetReviewForm()
    } catch (error) {
      setMessage((error as Error).message || 'Failed to submit review')
    }
  }

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      if (!isAuthenticated || !token) {
        setMessage('Please login to delete your review')
        return
      }

      logTokenInfo(token, 'ReviewDelete')
      if (!isValidJWT(token)) {
        setMessage('Authentication error. Please login again.')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}/reviews`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to delete review')
      }

      const data = await res.json()
      setProduct(data)
      resetReviewForm()
      setMessage('Review deleted successfully!')
    } catch (error) {
      setMessage((error as ApiError).message || 'Error while deleting review')
    }
  }

  const resetReviewForm = () => {
    setComment('')
    setRating(5)
    setIsEditing(false)
  }

  const handleEditClick = (review: Review) => {
    setComment(review.comment)
    setRating(review.rating)
    setIsEditing(true)
  }

  const handleAddToCart = async () => {
    if (!product || isAddingToCart) return

    setIsAddingToCart(true)

    const variantEntries = Object.entries(selectedVariant)
      .filter(([, v]) => Boolean(v))
      .sort(([a], [b]) => a.localeCompare(b))

    const variantKey = variantEntries.length ? variantEntries.map(([k, v]) => `${k}:${v}`).join('|') : undefined
    const color = selectedVariant.color
    const optionEntries = variantEntries.filter(([k]) => k !== 'color')
    const variantOptions = optionEntries.reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = v
      return acc
    }, {})
    const sizeValue = optionEntries.length ? optionEntries.map(([k, v]) => `${k}:${v}`).join('|') : undefined

    const cartItem: CartItem = {
      product: {
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]
      },
      quantity: 1,
      ...(selectedVariant),
      size: sizeValue,
      color,
      variantOptions: variantOptions,
      variantKey
    }

    try {
      await useCartStore.getState().addItem(cartItem, token || undefined)
      alert('Added to cart!')
    } catch (error) {
      console.error('Add to cart error:', error)
      alert((error as Error).message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const averageRating = product?.reviews?.length
    ? (
      product.reviews
        .filter((r) => r.isApproved)
        .reduce((acc, cur) => acc + cur.rating, 0) /
      product.reviews.filter((r) => r.isApproved).length
    ).toFixed(1)
    : null

  const variantKeys = product?.variants && product.variants.length > 0
    ? Array.from(new Set(product.variants.flatMap((v) => Object.keys(v).filter((k) => v[k] !== undefined))))
    : []

  const getVariantValues = (key: string) =>
    Array.from(new Set(product?.variants?.map((v) => v[key]).filter((val): val is string => !!val)))

  if (!product) return <div className="page-shell text-lg text-gray-700">Loading...</div>

  const categoryLabel = getCategoryName(product.category, categories)

  return (
    <div className="page-shell max-w-6xl space-y-10">
      <button onClick={() => router.back()} className="ghost-btn">
        Back
      </button>

      <div className="section grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200">
            <Image
              src={product.images[currentImageIndex] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition duration-500"
            />

            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="ghost-btn absolute left-3 top-1/2 -translate-y-1/2 text-lg"
                >
                  ←
                </button>
                <button
                  onClick={handleNextImage}
                  className="ghost-btn absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                >
                  →
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((img: string, index: number) => (
              <button
                key={index}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border ${currentImageIndex === index ? 'border-orange-300' : 'border-gray-200'}`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${index}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="pill w-fit">{categoryLabel || 'Product'}</p>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{product.name}</h1>
              <p className="text-gray-700 dark:text-gray-300">{product.description}</p>
            </div>
            <FavoriteButton productId={product._id} variant="detail" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <p className="rounded-2xl bg-gray-100 px-4 py-2 text-2xl font-semibold text-gray-900 dark:bg-slate-800 dark:text-white">
              ${product.price}
            </p>
            {averageRating && (
              <span className="pill">Rated {averageRating}/5</span>
            )}
            <span className="pill">{product.reviews?.length || 0} reviews</span>
          </div>

          {product.variants?.length > 0 && (
            <div className="space-y-3">
              {variantKeys.map((key) => (
                <div className="space-y-2" key={key}>
                  <p className="text-sm font-semibold text-gray-800 capitalize dark:text-gray-200">{key}</p>
                  <div className="flex flex-wrap gap-2">
                    {getVariantValues(key).map((val) => (
                      <button
                        key={val}
                        onClick={() => setSelectedVariant((prev) => {
                          const isSelected = prev[key] === val
                          const newVariants = { ...prev }
                          if (isSelected) {
                            delete newVariants[key]
                          } else {
                            newVariants[key] = val
                          }
                          return newVariants
                        })}
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${selectedVariant[key] === val
                          ? 'border-orange-400 bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'border-gray-200 text-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800'
                          }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || (product.variants?.length > 0 && variantKeys.some((key) => !selectedVariant[key]))}
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAddingToCart
              ? 'Adding...'
              : product.variants?.length > 0 && variantKeys.some((key) => !selectedVariant[key])
                ? `Select ${variantKeys.filter((key) => !selectedVariant[key]).join(' / ')}`
                : 'Add to cart'
            }
          </button>
        </div>
      </div>

      <div className="section space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="headline dark:text-white">Customer reviews</h2>
          {product.reviews.some((r: Review) => (typeof r.user === 'string' ? r.user : r.user._id) === userId && !r.isApproved) && (
            <span className="pill bg-amber-50 text-amber-700">
              Your review is pending approval
            </span>
          )}
        </div>

        <div className="space-y-4">
          {product.reviews
            .filter((review: Review) => review.isApproved)
            .map((review: Review, idx: number) => (
              <div key={idx} className="surface rounded-2xl p-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    <span className="text-base">★</span>
                    <span className="font-semibold text-gray-900">{review.rating}/5</span>
                    <span className="pill text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-400">
                    {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                  </p>
                </div>
                <p className="mt-3 text-gray-800 dark:text-gray-200">{review.comment}</p>

                {userId === review.user._id && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleEditClick(review)}
                      className="ghost-btn px-3 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="ghost-btn px-3 py-2 text-sm text-rose-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}

          {product.reviews.filter((r: Review) => r.isApproved).length === 0 && (
            <div className="surface rounded-2xl p-4 text-center text-gray-700 dark:text-gray-400 dark:bg-slate-800 dark:border-slate-700">
              No reviews yet. Be the first to review this product.
            </div>
          )}
        </div>

        <div id="review-form" className="surface rounded-2xl p-6 dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit your review' : 'Write a review'}
          </h3>
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Rating</label>
              <StarRatingInput
                rating={rating}
                onChange={setRating}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input min-h-[120px] dark:bg-slate-900 dark:border-slate-700 dark:text-gray-200"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="primary-btn w-fit"
              >
                {isEditing ? 'Update review' : 'Submit review'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setComment('')
                    setRating(5)
                  }}
                  className="ghost-btn"
                >
                  Cancel edit
                </button>
              )}
            </div>
            {message && (
              <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.includes('success') ? 'border-emerald-400/40 bg-emerald-50 text-emerald-700' : 'border-rose-400/40 bg-rose-50 text-rose-700'}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>

      {product && categories.length > 0 && (
        <RelatedProducts productId={product._id} categories={categories} />
      )}
    </div>
  )
}
