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

            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminReviewsFetch')
                return
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/reviews/pending`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })
            if (!res.ok) {
                throw new Error('Failed to fetch pending reviews')
            }
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
                setLoading(false)
                return
            }

            logTokenInfo(token, 'AdminApproveReview')

            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminApproveReview')
                setMessage('Authentication error. Please login again.')
                setLoading(false)
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
                setLoading(false)
                return
            }

            logTokenInfo(token, 'AdminRejectReview')

            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminRejectReview')
                setMessage('Authentication error. Please login again.')
                setLoading(false)
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
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">REVIEW APPROVALS</h1>

                {message && (
                    <div className="mb-4 p-4 bg-blue-100 border-2 border-black">
                        {message}
                    </div>
                )}

                <div className="space-y-8">
                    {products.map(product => {
                        const pendingReviews = product.reviews.filter(review => !review.isApproved)
                        if (pendingReviews.length === 0) return null

                        return (
                            <div
                                key={product._id}
                                className="bg-pink-200 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <h2 className="text-2xl font-black mb-4">{product.name}</h2>
                                <div className="space-y-4">
                                    {pendingReviews.map(review => (
                                        <div
                                            key={review._id}
                                            className="bg-white p-4 border-2 border-black"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">
                                                        {review.user.firstName} {review.user.lastName}
                                                    </p>
                                                    <p className="text-yellow-500">
                                                        {"⭐".repeat(review.rating)}
                                                    </p>
                                                </div>
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => handleApproveReview(product._id, review._id)}
                                                        disabled={loading}
                                                        className="bg-green-500 text-white px-4 py-2 font-bold border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                                    >
                                                        ✓ APPROVE
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectReview(product._id, review._id)}
                                                        disabled={loading}
                                                        className="bg-red-500 text-white px-4 py-2 font-bold border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                                    >
                                                        ✕ REJECT
                                                    </button>
                                                </div>
                                            </div>
                                            <p>{review.comment}</p>
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