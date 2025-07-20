'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import FavoriteButton from '@/components/FavoriteButton'
import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'

export default function ProductDetailPage() {
    const router = useRouter()
    const { id } = useParams()
    const [product, setProduct] = useState<any>(null)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [comment, setComment] = useState('')
    const [rating, setRating] = useState(5)
    const [message, setMessage] = useState('')
    const [userId, setUserId] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)


    const fetchProduct = async () => {
        const res = await fetch(`http://localhost:5000/api/products/${id}`)
        const data = await res.json()
        setProduct(data)
    }


    const handleNextImage = () => {
        if (product.images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
        }
    }

    const handlePrevImage = () => {
        if (product.images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
        }
    }

    const fetchUser = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        const user = await res.json()
        setUserId(user._id)
    }

    useEffect(() => {
        fetchProduct()
        fetchUser()
    }, [id])

    useEffect(() => {
        if (!product || !userId) return
        const existingReview = product.reviews.find((r: any) => r.user === userId)
        if (existingReview) {
            setComment(existingReview.comment)
            setRating(existingReview.rating)
        }
    }, [product, userId])

    const handleEditClick = (review: any) => {
        setComment(review.comment)
        setRating(review.rating)
        setIsEditing(true)
        document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setMessage('Please login to submit a review')
                return
            }

            const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
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
            setComment('')
            setRating(5)
        } catch (error: any) {
            setMessage(error.message || 'An error occurred while submitting the review.')
        }
    }

    const handleDeleteReview = async () => {
        if (!confirm('Are you sure you want to delete this review?')) return

        setMessage('')
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setMessage('Please login to delete your review')
                return
            }

            const res = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || 'Failed to delete review')
            }

            const data = await res.json()
            setProduct(data)
            setComment('')
            setRating(5)
            setMessage('Review deleted successfully!')
        } catch (error: any) {
            setMessage(error.message || 'Error while deleting review')
        }
    }

    const averageRating = product?.reviews?.length
        ? (
            product.reviews
                .filter((r: any) => r.isApproved)
                .reduce((acc: number, cur: any) => acc + cur.rating, 0) /
            product.reviews.filter((r: any) => r.isApproved).length
        ).toFixed(1)
        : null

    if (!product) return <div className="p-6 text-2xl font-black">Loading...</div>

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="mb-6 px-4 py-2 bg-black border-4 border-black font-black"
            >
                ← BACK
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-4 border-black bg-black p-4">
                    <div className="relative aspect-square w-full">
                        <Image
                            src={product.images[currentImageIndex] || '/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover border-4 border-black"
                        />

                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white border-4 border-black px-2 py-1 font-black hover:bg-gray-100"
                                >
                                    ◀
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white border-4 border-black px-2 py-1 font-black hover:bg-gray-100"
                                >
                                    ▶
                                </button>
                            </>
                        )}
                    </div>

                    {/* Thumbnail row */}
                    <div className="flex mt-4 gap-2 overflow-x-auto">
                        {product.images.map((img: string, index: number) => (
                            <div
                                key={index}
                                className={`relative w-16 aspect-square flex-shrink-0 cursor-pointer border-4 ${currentImageIndex === index ? 'border-red-500' : 'border-gray-400'
                                    }`}
                                onClick={() => setCurrentImageIndex(index)}
                            >
                                <Image
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-pink-200 border-4 border-black p-6">
                    <h1 className="text-4xl font-black mb-4">{product.name}</h1>
                    <p className="text-xl font-bold mb-4 bg-gray-400 border-2 border-black p-2">{product.description}</p>
                    <p className="text-3xl font-black mb-4 bg-yellow-500 inline-block p-2 border-4 border-black">
                        ₺{product.price}
                    </p>

                    {averageRating && (
                        <p className="text-lg font-bold mb-2 bg-gray-500 border-2 border-black px-2 py-1 inline-block">
                            ⭐ {averageRating}/5
                        </p>
                    )}

                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-black mb-4">{product.name}</h1>
                        <FavoriteButton productId={product._id} variant="detail" />
                    </div>

                    {/* Variant selectors */}
                    {product.variants?.length > 0 && (
                        <div className="mt-4">
                            <div className="mb-2">
                                <label className="font-black">Size:</label>
                                <div className="flex gap-2 mt-1">
                                    {Array.from(new Set<string>(product.variants.map((v: any) => v.size))).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`border px-3 py-1 rounded font-bold ${selectedSize === size ? 'bg-black text-white' : ''}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-2">
                                <label className="font-black">Color:</label>
                                <div className="flex gap-2 mt-1">
                                    {[...new Set(product.variants.map((v: any) => v.color))].map((color: unknown) => (
                                        <button
                                            key={color as string}
                                            onClick={() => setSelectedColor(color as string)}
                                            className={`border px-3 py-1 rounded font-bold ${selectedColor === color ? 'bg-black text-white' : ''}`}
                                        >
                                            {color as string}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={async () => {
                            const newItem = {
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.images[0],
                                quantity: 1,
                                ...(selectedSize && { size: selectedSize }),
                                ...(selectedColor && { color: selectedColor })
                            }

                            try {
                                await useCartStore.getState().addItem(newItem)
                                alert('Added to cart!')
                            } catch (error: any) {
                                console.error('Add to cart error:', error)
                                alert(error.message || 'Failed to add to cart')
                            }
                        }}
                        disabled={product.variants?.length > 0 && (!selectedSize || !selectedColor)}
                        className={`w-full p-4 text-white border-4 border-black font-black mt-4 transition-all duration-150
                            ${product.variants?.length > 0 && (!selectedSize || !selectedColor)
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-400 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                            }`}
                    >
                        {product.variants?.length > 0 && (!selectedSize || !selectedColor)
                            ? 'PLEASE SELECT SIZE AND COLOR'
                            : 'ADD TO CART'
                        }
                    </button>

                </div>
            </div>

            {/* Reviews */}
            <div className="mt-12 bg-yellow-200 border-4 border-black p-6">
                <h2 className="text-3xl font-black mb-6">CUSTOMER REVIEWS</h2>

                {/* Show message if review is pending approval */}
                {product.reviews.some((r: any) => r.user === userId && !r.isApproved) && (
                    <div className="bg-blue-200 border-4 border-black p-4 mb-4 font-bold">
                        Your review is pending approval. It will be visible once approved by an admin.
                    </div>
                )}

                {/* Only show approved reviews */}
                {product.reviews
                    .filter((review: any) => review.isApproved)
                    .map((review: any, idx: number) => (
                        <div key={idx} className="bg-gray-500 border-4 border-black p-4 mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-xl">{'⭐'.repeat(review.rating)}</p>
                                    <p className="text-sm font-bold bg-pink-400 px-2 py-1 border-2 border-black">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <p className="font-bold text-sm bg-blue-400 px-2 py-1 border-2 border-black">
                                    {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                                </p>
                            </div>
                            <p className="font-bold mb-2">{review.comment}</p>

                            {userId === review.user && (
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleEditClick(review)}
                                        className="text-sm px-2 py-1 bg-yellow-400 border-2 border-black font-black"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDeleteReview}
                                        className="text-sm px-2 py-1 bg-red-400 border-2 border-black font-black"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                {/* Show message if no approved reviews */}
                {product.reviews.filter((r: any) => r.isApproved).length === 0 && (
                    <div className="bg-gray-200 border-4 border-black p-4 text-center font-bold">
                        No reviews yet. Be the first to review this product!
                    </div>
                )}

                {/* Review form */}
                <div id="review-form" className="mt-8 bg-blue-300 border-4 border-black p-6">
                    <h3 className="text-2xl font-black mb-4">
                        {isEditing ? 'EDIT YOUR REVIEW' : 'WRITE A REVIEW'}
                    </h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                            <label className="font-black block mb-2">RATING</label>
                            <select
                                value={rating}
                                onChange={e => setRating(Number(e.target.value))}
                                className="w-full p-3 border-4 border-black font-bold bg-gray-400"
                            >
                                {[1, 2, 3, 4, 5].map(n => (
                                    <option key={n} value={n}>{'⭐'.repeat(n)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="font-black block mb-2">COMMENT</label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                className="w-full p-3 border-4 border-black font-bold bg-gray-400"
                                rows={4}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-3 bg-green-400 border-4 border-black font-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            {isEditing ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false)
                                    setComment('')
                                    setRating(5)
                                }}
                                className="w-full p-3 bg-gray-400 border-4 border-black font-black hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                CANCEL EDIT
                            </button>
                        )}
                        {message && (
                            <div className={`p-3 mt-2 border-4 border-black font-black ${message.includes('success') ? 'bg-green-300' : 'bg-red-300'}`}>
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}
