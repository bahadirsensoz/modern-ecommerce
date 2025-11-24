'use client'

import AdminGuard from '@/components/guards/AdminGuard'
import { useEffect, useState } from 'react'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function AdminReviewsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { isAuthenticated, token } = useAuthStore()

  const fetchProducts = async () => {
    try {
      if (!isAuthenticated || !token) {
        console.error('No authentication token found')
        return
      }

      logTokenInfo(token, 'AdminReviewsFetch')
      if (!isValidJWT(token)) return

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/reviews/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch pending reviews')
      const data = await res.json()
      setProducts(data)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setMessage('Failed to fetch pending reviews')
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleApproveReview = async (productId: string, reviewId: string) => {
    try {
      setLoading(true)
      if (!isAuthenticated || !token) {
        setMessage('Authentication error. Please login again.')
        return
      }
      logTokenInfo(token, 'AdminApproveReview')
      if (!isValidJWT(token)) {
        setMessage('Authentication error. Please login again.')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (res.ok) {
        setMessage('Review approved successfully!')
        fetchProducts()
      } else {
        throw new Error('Failed to approve review')
      }
    } catch (error) {
      setMessage('Failed to approve review')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectReview = async (productId: string, reviewId: string) => {
    try {
      setLoading(true)
      if (!isAuthenticated || !token) {
        setMessage('Authentication error. Please login again.')
        return
      }
      logTokenInfo(token, 'AdminRejectReview')
      if (!isValidJWT(token)) {
        setMessage('Authentication error. Please login again.')
        return
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      if (res.ok) {
        setMessage('Review rejected successfully!')
        fetchProducts()
      } else {
        throw new Error('Failed to reject review')
      }
    } catch (error) {
      setMessage('Failed to reject review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminGuard>
      <div className="page-shell space-y-6 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline">Review approvals</h1>
          </div>
          {message && (
            <div className="text-sm text-blue-600">
              {message}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {products.map(product => {
            const pendingReviews = product.reviews.filter(review => !review.isApproved)
            if (pendingReviews.length === 0) return null

            return (
              <div key={product._id} className="section space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-600">{pendingReviews.length} pending</p>
                </div>
                <div className="space-y-3">
                  {pendingReviews.map(review => (
                    <div key={review._id} className="surface rounded-lg p-4 border border-gray-200 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </p>
                          <p className="text-amber-500">{'★'.repeat(review.rating)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveReview(product._id, review._id)}
                            disabled={loading}
                            className="primary-btn text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectReview(product._id, review._id)}
                            disabled={loading}
                            className="ghost-btn text-sm text-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminGuard>
  )
}
