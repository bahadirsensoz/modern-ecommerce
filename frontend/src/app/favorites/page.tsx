'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, token } = useAuthStore()

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false)
        return
      }

      logTokenInfo(token, 'FavoritesPage')

      if (!isValidJWT(token)) {
        console.error('Invalid JWT token in FavoritesPage')
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        const data = await res.json()

        setFavorites(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching favorites:', error)
        setFavorites([])
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, token])

  if (loading) {
    return <p className="page-shell text-sm text-gray-600">Loading favorites...</p>
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="pill">Saved items</p>
          <h1 className="headline">Favorites</h1>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="section text-gray-700">
          No favorites yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((product) =>
            product._id ? (
              <ProductCard key={product._id} product={product} />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
