'use client'

import { useEffect, useState } from 'react'
import { Category, Product } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'

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
        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
        await fetch(`http://localhost:5000/api/products/${id}`, {
            method: 'DELETE',
        })
        fetchProducts()
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin: Products</h1>

            <form onSubmit={handleSubmit} className="space-y-3 mb-6">
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="input"
                    required
                />
                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="input"
                />
                <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Price"
                    type="number"
                    className="input"
                    required
                />
                <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Image URL"
                    className="input"
                />

                <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="input bg-white text-black border border-gray-300 px-3 py-2 rounded-md"
                    required
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>

                <button type="submit" className="btn w-full">
                    Create Product
                </button>
                {message && <p className="text-sm">{message}</p>}
            </form>

            <ul className="space-y-2">
                {products.map((product) => (
                    <li
                        key={product._id}
                        className="border p-3 flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm">
                                ₺{product.price} — {getCategoryName(product.category, categories)}
                            </p>
                        </div>
                        <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-500 hover:underline"
                        >
                            Delete
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
