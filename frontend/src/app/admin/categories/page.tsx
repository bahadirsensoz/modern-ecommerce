'use client'

import { useEffect, useState } from 'react'
import { Category } from '@/types'
import AdminGuard from '@/components/guards/AdminGuard'

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('')
    const [message, setMessage] = useState('')

    const fetchCategories = async () => {
        const res = await fetch('http://localhost:5000/api/categories')
        const data = await res.json()
        setCategories(data)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, image })
        })
        const data = await res.json()
        if (res.ok) {
            setMessage('Category created!')
            setName('')
            setDescription('')
            setImage('')
            fetchCategories()
        } else {
            setMessage(`${data.message}`)
        }
    }

    const handleDelete = async (id: string) => {
        await fetch(`http://localhost:5000/api/categories/${id}`, { method: 'DELETE' })
        fetchCategories()
    }

    return (
        <AdminGuard>
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">Admin: Categories</h1>

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
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Image URL"
                        className="input"
                    />
                    <button type="submit" className="btn w-full">
                        Create Category
                    </button>
                    {message && <p className="mt-2 text-sm">{message}</p>}
                </form>

                <ul className="space-y-2">
                    {categories.map((cat) => (
                        <li
                            key={cat._id}
                            className="border p-3 flex justify-between items-center"
                        >
                            <div>
                                <p className="font-semibold">{cat.name}</p>
                                <p className="text-sm">{cat.description}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                className="text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </AdminGuard>
    )
}
