'use client'

import { useEffect, useState } from 'react'
import { Category } from '@/types'
import AdminGuard from '@/components/guards/AdminGuard'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [message, setMessage] = useState('')
    const { isAuthenticated, token } = useAuthStore()

    const fetchCategories = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        const data = await res.json()
        setCategories(data)
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (!isAuthenticated || !token) {
                setMessage('Authentication error. Please login again.')
                return
            }

            logTokenInfo(token, 'AdminCreateCategory')

            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminCreateCategory')
                setMessage('Authentication error. Please login again.')
                return
            }

            const formData = new FormData()
            formData.append('name', name)
            formData.append('description', description)
            if (imageFile) {
                formData.append('image', imageFile)
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                credentials: 'include',
                body: formData
            })

            const data = await res.json()
            if (res.ok) {
                setMessage('Category created!')
                setName('')
                setDescription('')
                setImageFile(null)
                fetchCategories()
            } else {
                setMessage(data.message || 'Failed to create category')
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to create category')
        }
    }

    const handleDelete = async (id: string) => {
        if (!isAuthenticated || !token) {
            console.error('No authentication token found')
            return
        }

        logTokenInfo(token, 'AdminDeleteCategory')

        if (!isValidJWT(token)) {
            console.error('Invalid JWT token in AdminDeleteCategory')
            return
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        fetchCategories()
    }

    return (
        <AdminGuard>
            <div className="p-6 max-w-2xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">MANAGE CATEGORIES</h1>

                <form onSubmit={handleSubmit} className="bg-pink-200 p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
                    <h2 className="text-2xl font-black mb-4">ADD NEW CATEGORY</h2>
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
                            type="file"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full p-3 border-4 border-black font-bold focus:outline-none focus:ring-4 focus:ring-blue-400"
                            accept="image/*"
                        />
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            CREATE CATEGORY
                        </button>
                        {message && <p className="font-bold text-center">{message}</p>}
                    </div>
                </form>

                <ul className="space-y-2">
                    {categories.map((cat) => (
                        <li
                            key={cat._id}
                            className="border-4 border-black p-4 flex justify-between items-center bg-white hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                {cat.image && (
                                    <div className="relative w-16 h-16 border-2 border-black">
                                        <Image
                                            src={cat.image}
                                            alt={cat.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                                <div>
                                    <p className="font-black">{cat.name}</p>
                                    <p className="text-sm">{cat.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cat._id)}
                                className="bg-red-500 text-white font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                            >
                                DELETE
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </AdminGuard>
    )
}
