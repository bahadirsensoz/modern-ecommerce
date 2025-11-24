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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="section w-full max-w-md space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Edit category</h2>
        <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Name" />
        <input value={description} onChange={e => setDescription(e.target.value)} className="input" placeholder="Description" />
        <div className="flex justify-end gap-2 pt-2">
          <button className="ghost-btn text-sm" onClick={onClose}>Cancel</button>
          <button className="primary-btn text-sm" onClick={() => onSave({ ...category, name, description })}>Save</button>
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
        setMessage('Authentication error. Please login again.')
        return
      }

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      if (imageFile) formData.append('image', imageFile)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
    if (!isAuthenticated || !token) return
    logTokenInfo(token, 'AdminDeleteCategory')
    if (!isValidJWT(token)) return

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
      <div className="page-shell space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline">Manage categories</h1>
          </div>
          {message && <p className="text-sm text-red-500">{message}</p>}
        </div>

        <div className="section space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Add new category</h2>
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="input" required />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="input" />
            <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input sm:col-span-2" accept="image/*" />
            <button type="submit" className="primary-btn sm:w-fit">Create category</button>
          </form>
        </div>

        <div className="section space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Existing categories</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {categories.map((cat) => (
              <div key={cat._id} className="surface border border-gray-200 rounded-lg p-4 space-y-2">
                <div className="relative w-full h-40 overflow-hidden rounded-md bg-gray-100">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-sm text-gray-600">{cat.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditCategory(cat)
                      setEditOpen(true)
                    }}
                    className="ghost-btn text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="ghost-btn text-sm text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditCategoryModal open={editOpen} onClose={() => setEditOpen(false)} category={editCategory} onSave={handleSaveEdit} />
    </AdminGuard>
  )
}
