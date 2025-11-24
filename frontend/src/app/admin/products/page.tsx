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
  const [price, setPrice] = useState(product?.price?.toString() || '')
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="section w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Edit product</h2>
        <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Name" />
        <input value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Description" />
        <input value={price} onChange={e => setPrice(e.target.value)} className="input" placeholder="Price" type="number" />
        <input value={stock} onChange={e => setStock(e.target.value)} className="input" placeholder="Stock" type="number" />
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
          <option value="">Select Category</option>
          {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button className="ghost-btn text-sm" onClick={onClose}>Cancel</button>
          <button className="primary-btn text-sm" onClick={() => {
            const updated = { ...product, name, description, price: parseFloat(price), stock: parseInt(stock), isActive, category: { ...product.category, _id: categoryId } }
            onSave(updated)
          }}>Save</button>
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
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [categoryId, setCategoryId] = useState('')
  const [message, setMessage] = useState('')
  const { isAuthenticated, token } = useAuthStore()
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

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

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

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
        setMessage('Authentication error. Please login again.')
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('stock', stock || '0')
      formData.append('isActive', isActive.toString())
      formData.append('category', categoryId)
      if (imageFiles) {
        Array.from(imageFiles).forEach(file => formData.append('images', file))
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: formData
      })

      const data = await res.json()
      if (res.ok) {
        setMessage('Product created!')
        setName('')
        setDescription('')
        setPrice('')
        setStock('')
        setImageFiles(null)
        fetchProducts()
      } else {
        setMessage(data.message || 'Failed to create product')
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create product')
    }
  }

  const handleDelete = async (id: string) => {
    if (!isAuthenticated || !token) return
    logTokenInfo(token, 'AdminDeleteProduct')
    if (!isValidJWT(token)) return

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

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    )
  }

  const handleBulkUpdate = async (activate: boolean) => {
    if (!isAuthenticated || !token || selectedProducts.length === 0) return
    logTokenInfo(token, 'AdminBulkUpdateProducts')
    if (!isValidJWT(token)) return

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/bulk-status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ productIds: selectedProducts, isActive: activate })
    })
    setSelectedProducts([])
    fetchProducts()
  }

  const handleEditSave = async (updated: Product) => {
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
      body: JSON.stringify(updated)
    })
    if (res.ok) {
      setEditOpen(false)
      setEditProduct(null)
      fetchProducts()
    }
  }

  return (
    <AdminGuard>
      <div className="page-shell space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline">Manage products</h1>
          </div>
          {message && <p className="text-sm text-red-500">{message}</p>}
        </div>

        <form onSubmit={handleSubmit} className="section grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Product Name" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Description" />
            <input value={price} onChange={e => setPrice(e.target.value)} className="input" placeholder="Price" type="number" step="0.01" />
            <input value={stock} onChange={e => setStock(e.target.value)} className="input" placeholder="Stock" type="number" />
          </div>
          <div className="space-y-3">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="input">
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              Active
            </label>
            <input type="file" multiple accept="image/*" onChange={e => setImageFiles(e.target.files)} className="input" />
            <button className="primary-btn sm:w-fit">Create product</button>
          </div>
        </form>

        <div className="flex flex-wrap gap-2">
          <button className="ghost-btn text-sm" onClick={() => handleBulkUpdate(true)} disabled={selectedProducts.length === 0}>Activate selected</button>
          <button className="ghost-btn text-sm text-red-600" onClick={() => handleBulkUpdate(false)} disabled={selectedProducts.length === 0}>Deactivate selected</button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {products.map(prod => (
            <div key={prod._id} className="surface border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(prod._id)}
                    onChange={() => handleSelectProduct(prod._id)}
                  />
                  Select
                </label>
                <span className={`pill text-xs ${prod.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {prod.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="relative w-full h-40 overflow-hidden rounded-md bg-gray-100">
                {prod.images && prod.images.length > 0 ? (
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">No image</div>
                )}
              </div>
              <h3 className="font-semibold text-gray-900">{prod.name}</h3>
              <p className="text-lg font-semibold text-gray-900">${prod.price.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{getCategoryName(prod.category, categories)}</p>
              <p className="text-sm text-gray-600">Stock: {prod.stock ?? 0}</p>
              <div className="flex gap-2">
                <button
                  className="ghost-btn text-sm"
                  onClick={() => {
                    setEditProduct(prod)
                    setEditOpen(true)
                  }}
                >
                  Edit
                </button>
                <button
                  className="ghost-btn text-sm text-red-600"
                  onClick={() => handleDelete(prod._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <EditProductModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        product={editProduct}
        categories={categories}
        onSave={handleEditSave}
      />
    </AdminGuard>
  )
}
