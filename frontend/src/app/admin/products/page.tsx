'use client'

import { useEffect, useState } from 'react'
import { Category, Product } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import AdminGuard from '@/components/guards/AdminGuard'
import Image from 'next/image'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [image, setImage] = useState('')
    const [imageFiles, setImageFiles] = useState<FileList | null>(null)
    const [categoryId, setCategoryId] = useState('')
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setMessage('')

        try {
            if (!name.trim() || !price || !categoryId) {
                setMessage('Name, price and category are required!')
                return
            }

            const token = localStorage.getItem('token')
            const formData = new FormData()

            formData.append('name', name.trim())
            formData.append('description', description.trim())
            formData.append('price', price)
            formData.append('category', categoryId)

            if (imageFiles) {
                Array.from(imageFiles).forEach(file => {
                    formData.append('images', file)
                })
            }

            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create product')
            }

            setName('')
            setDescription('')
            setPrice('')
            setCategoryId('')
            setImageFiles(null)
            setMessage('Product created successfully!')

            fetchProducts()
        } catch (error: unknown) {
            console.error('Error creating product:', error)
            setMessage(error instanceof Error ? error.message : 'Failed to create product')
        }
    }

    const handleDelete = async (id: string) => {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        fetchProducts()
    }

    return (
        <AdminGuard>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">MANAGE PRODUCTS</h1>

                <form onSubmit={handleSubmit} className="bg-pink-200 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <h2 className="text-2xl font-black mb-4">ADD NEW PRODUCT</h2>
                    <div className="space-y-4">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                            required
                        />
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                        />
                        <input
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Price"
                            type="number"
                            step="0.01"
                            min="0"
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                            required
                        />
                        <input
                            type="file"
                            multiple
                            onChange={(e) => setImageFiles(e.target.files)}
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                        />
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400 bg-white"
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            CREATE PRODUCT
                        </button>
                        {message && <p className="font-bold text-center">{message}</p>}
                    </div>
                </form>

                <div className="grid gap-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white p-4 border-4 border-black flex justify-between items-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                {product.images && product.images[0] && (
                                    <div className="relative w-20 h-20 border-2 border-black">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-black text-xl">{product.name}</p>
                                    <p className="font-bold">
                                        <span className="bg-yellow-300 px-2">₺{product.price}</span>
                                        {" — "}
                                        <span className="bg-blue-400 text-white px-2">
                                            {getCategoryName(product.category, categories)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(product._id)}
                                className="bg-red-500 text-white font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                DELETE
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </AdminGuard>
    )
}
function fetchProducts() {
    throw new Error('Function not implemented.')
}

