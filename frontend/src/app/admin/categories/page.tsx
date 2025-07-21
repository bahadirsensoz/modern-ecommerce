'use client'

import { useEffect, useState } from 'react'
import { Category } from '@/types'
import AdminGuard from '@/components/guards/AdminGuard'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

function EditCategoryModal({ open, onClose, category, onSave }: {
    open: boolean,
    onClose: () => void,
    category: Category | null,
    onSave: (updated: Category) => void
}) {
    const [name, setName] = useState(category?.name || '')
    const [description, setDescription] = useState(category?.description || '')
    useEffect(() => {
        setName(category?.name || '')
        setDescription(category?.description || '')
    }, [category])
    if (!open || !category) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-4 border-black w-full max-w-md">
                <h2 className="text-2xl font-black mb-4">Edit Category</h2>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border mb-2" placeholder="Name" />
                <input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border mb-2" placeholder="Description" />
                <div className="flex gap-2 mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 font-bold border-2 border-black" onClick={async () => {
                        const updated = { ...category, name, description }
                        onSave(updated)
                    }}>Save</button>
                    <button className="bg-gray-300 px-4 py-2 font-bold border-2 border-black" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [message, setMessage] = useState('')
    const { isAuthenticated, token } = useAuthStore()
    const [editCategory, setEditCategory] = useState<Category | null>(null)
    const [editOpen, setEditOpen] = useState(false)

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

    const handleEdit = (category: Category) => {
        setEditCategory(category)
        setEditOpen(true)
    }
    const handleSaveEdit = async (updated: Category) => {
        if (!isAuthenticated || !token) return
        logTokenInfo(token, 'AdminEditCategory')
        if (!isValidJWT(token)) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${updated._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                name: updated.name,
                description: updated.description
            })
        })
        if (res.ok) {
            setEditOpen(false)
            setEditCategory(null)
            fetchCategories()
        }
    }

    return (
        <AdminGuard>
            <EditCategoryModal open={editOpen} onClose={() => setEditOpen(false)} category={editCategory} onSave={handleSaveEdit} />
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
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(cat)}
                                    className="bg-yellow-400 text-black font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => handleDelete(cat._id)}
                                    className="bg-red-500 text-white font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    DELETE
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </AdminGuard>
    )
}
