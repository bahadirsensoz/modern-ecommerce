'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { CartItem } from '@/types'

export default function CartHydration() {
    const { syncCart } = useCartStore()
    const { isAuthenticated, token } = useAuthStore()

    useEffect(() => {
        const wasCleared = localStorage.getItem('cartCleared')
        if (wasCleared) {
            localStorage.removeItem('cartCleared')
            useCartStore.getState().clearCart()
            return
        }

        syncCart(token || undefined)
    }, [syncCart, token])

    return null
}
