'use client'

import { useEffect, useState } from 'react'
import { Category, Product } from '@/types'
import { getCategoryName } from '@/utils/getCategoryName'
import AdminGuard from '@/components/guards/AdminGuard'
import Image from 'next/image'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

function EditProductModal({ open, onClose, product, categories, onSave }: {
    open: boolean,
    onClose: () => void,
    product: Product | null,
    categories: Category[],
    onSave: (updated: Product) => void
}) {
    const [name, setName] = useState(product?.name || '')
    const [description, setDescription] = useState(product?.description || '')
    const [price, setPrice] = useState(product?.price.toString() || '')
    const [stock, setStock] = useState(product?.stock?.toString() || '0')
    const [isActive, setIsActive] = useState(product?.isActive ?? true)
    const [categoryId, setCategoryId] = useState(product?.category?._id || '')
    useEffect(() => {
        setName(product?.name || '')
        setDescription(product?.description || '')
        setPrice(product?.price?.toString() || '')
        setStock(product?.stock?.toString() || '0')
        setIsActive(product?.isActive ?? true)
        setCategoryId(product?.category?._id || '')
    }, [product])
    if (!open || !product) return null
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg border-4 border-black w-full max-w-md">
                <h2 className="text-2xl font-black mb-4">Edit Product</h2>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border mb-2" placeholder="Name" />
                <input value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border mb-2" placeholder="Description" />
                <input value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2 border mb-2" placeholder="Price" type="number" />
                <input value={stock} onChange={e => setStock(e.target.value)} className="w-full p-2 border mb-2" placeholder="Stock" type="number" />
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2 border mb-2">
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
                <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
                </label>
                <div className="flex gap-2 mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 font-bold border-2 border-black" onClick={async () => {
                        const updated = { ...product, name, description, price: parseFloat(price), stock: parseInt(stock), isActive, category: { ...product.category, _id: categoryId } }
                        onSave(updated)
                    }}>Save</button>
                    <button className="bg-gray-300 px-4 py-2 font-bold border-2 border-black" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [stock, setStock] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [image, setImage] = useState('')
    const [imageFiles, setImageFiles] = useState<FileList | null>(null)
    const [categoryId, setCategoryId] = useState('')
    const [message, setMessage] = useState('')
    const { isAuthenticated, token } = useAuthStore()
    const [editProduct, setEditProduct] = useState<Product | null>(null)
    const [editOpen, setEditOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState<string[]>([])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/admin`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            credentials: 'include'
        })
        const data = await res.json()
        setProducts(data)
    }

    const fetchCategories = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
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

            if (!isAuthenticated || !token) {
                setMessage('Authentication error. Please login again.')
                return
            }

            logTokenInfo(token, 'AdminCreateProduct')

            if (!isValidJWT(token)) {
                console.error('Invalid JWT token in AdminCreateProduct')
                setMessage('Authentication error. Please login again.')
                return
            }

            const formData = new FormData()

            formData.append('name', name.trim())
            formData.append('description', description.trim())
            formData.append('price', price)
            formData.append('stock', stock)
            formData.append('isActive', isActive.toString())
            formData.append('category', categoryId)

            if (imageFiles) {
                Array.from(imageFiles).forEach(file => {
                    formData.append('images', file)
                })
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create product')
            }

            setName('')
            setDescription('')
            setPrice('')
            setStock('')
            setIsActive(true)
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
        if (!isAuthenticated || !token) {
            console.error('No authentication token found')
            return
        }

        logTokenInfo(token, 'AdminDeleteProduct')

        if (!isValidJWT(token)) {
            console.error('Invalid JWT token in AdminDeleteProduct')
            return
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        fetchProducts()
    }

    const handleEdit = (product: Product) => {
        setEditProduct(product)
        setEditOpen(true)
    }
    const handleSaveEdit = async (updated: Product) => {
        if (!isAuthenticated || !token) return
        logTokenInfo(token, 'AdminEditProduct')
        if (!isValidJWT(token)) return
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${updated._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
                name: updated.name,
                description: updated.description,
                price: updated.price,
                stock: updated.stock,
                isActive: updated.isActive,
                category: updated.category._id
            })
        })
        if (res.ok) {
            setEditOpen(false)
            setEditProduct(null)
            fetchProducts()
        }
    }

    const handleBulkUpdate = async (isActive: boolean) => {
        if (!isAuthenticated || !token) return
        logTokenInfo(token, 'AdminBulkUpdateProducts')
        if (!isValidJWT(token)) return
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-activate`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({ ids: selectedProducts, isActive })
        })
        setSelectedProducts([])
        fetchProducts()
    }

    return (
        <AdminGuard>
            <EditProductModal open={editOpen} onClose={() => setEditOpen(false)} product={editProduct} categories={categories} onSave={handleSaveEdit} />
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
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            placeholder="Stock"
                            type="number"
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
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
                        </label>
                        <button
                            type="submit"
                            className="w-full p-3 bg-blue-400 text-white font-black border-4 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            CREATE PRODUCT
                        </button>
                        {message && <p className="font-bold text-center">{message}</p>}
                    </div>
                </form>
                <div className="flex gap-2 mb-4">
                    <button className="bg-green-400 text-white font-black px-4 py-2 border-2 border-black" onClick={() => handleBulkUpdate(true)} disabled={selectedProducts.length === 0}>Activate Selected</button>
                    <button className="bg-gray-400 text-black font-black px-4 py-2 border-2 border-black" onClick={() => handleBulkUpdate(false)} disabled={selectedProducts.length === 0}>Deactivate Selected</button>
                </div>
                <div className="grid gap-4">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white p-4 border-4 border-black flex justify-between items-center hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                        >
                            <input type="checkbox" checked={selectedProducts.includes(product._id)} onChange={e => {
                                setSelectedProducts(prev => e.target.checked ? [...prev, product._id] : prev.filter(id => id !== product._id))
                            }} className="mr-2" />
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
                                    <p className="text-sm">Stock: <span className="font-bold">{product.stock}</span></p>
                                    <p className="text-sm">Status: <span className={`font-bold ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="bg-yellow-400 text-black font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    EDIT
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id)}
                                    className="bg-red-500 text-white font-black px-4 py-2 border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                >
                                    DELETE
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminGuard>
    )
}

