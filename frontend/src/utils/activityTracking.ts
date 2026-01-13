import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'

export const trackActivity = async (activityData: {
    activityType: 'view' | 'purchase' | 'favorite' | 'cart_add' | 'search'
    productId?: string
    categoryId?: string
    searchQuery?: string
    metadata?: Record<string, unknown>
}) => {
    try {
        const { isAuthenticated, token } = useAuthStore.getState()
        const { sessionId } = useCartStore.getState()

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        }

        if (isAuthenticated && token) {
            headers.Authorization = `Bearer ${token}`
        } else if (sessionId) {
            headers['X-Session-Id'] = sessionId
        }

        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recommendations/track`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify(activityData)
        })
    } catch (error) {
        console.error('Failed to track activity:', error)
    }
}

export const trackProductView = (productId: string, categoryId?: string) => {
    trackActivity({
        activityType: 'view',
        productId,
        categoryId
    })
}

export const trackProductPurchase = (productId: string, categoryId?: string) => {
    trackActivity({
        activityType: 'purchase',
        productId,
        categoryId
    })
}

export const trackProductFavorite = (productId: string, categoryId?: string) => {
    trackActivity({
        activityType: 'favorite',
        productId,
        categoryId
    })
}

export const trackCartAdd = (productId: string, categoryId?: string) => {
    trackActivity({
        activityType: 'cart_add',
        productId,
        categoryId
    })
}

export const trackSearch = (searchQuery: string) => {
    trackActivity({
        activityType: 'search',
        searchQuery
    })
} 