'use client'

import { useEffect, useState } from 'react'
import { Category, Product } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import AdminGuard from '@/components/guards/AdminGuard'

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [image, setImage] = useState('')
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
        const token = localStorage.getItem('token')

        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                name,
                description,
                price: parseFloat(price),
                image,
                category: categoryId,
            }),
        })

        const data = await res.json()
        if (res.ok) {
            setMessage('Product created!')
            setName('')
            setDescription('')
            setPrice('')
            setImage('')
            setCategoryId('')
            fetchProducts()
        } else {
            setMessage(`${data.message}`)
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
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                            required
                        />
                        <input
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="Image URL"
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
