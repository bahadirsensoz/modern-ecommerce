import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Cart, CartItem } from '@/types'

interface CartStore {
    items: CartItem[]
    sessionId: string | null
    addItem: (item: CartItem, token?: string) => Promise<void>
    removeFromCart: (productId: string, token?: string) => Promise<void>
    updateQuantity: (productId: string, quantity: number, token?: string) => Promise<void>
    setCart: (items: CartItem[]) => void
    clearCart: () => void
    setSessionId: (sessionId: string) => void
    syncCart: (token?: string) => Promise<void>
}

const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            sessionId: null,

            setSessionId: (sessionId) => set({ sessionId }),

            syncCart: async (token) => {
                const { sessionId } = get()

                if (token) {
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include'
                        })

                        if (res.ok) {
                            const data = await res.json()
                            if (data?.items) {
                                const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                    product: {
                                        _id: item.product._id,
                                        name: item.product.name,
                                        price: item.product.price,
                                        image: item.product.image?.[0] || item.product.image
                                    },
                                    quantity: item.quantity,
                                    size: item.size,
                                    color: item.color
                                }))
                                set({ items: formattedItems })
                            }
                        }
                    } catch (error) {
                        console.error('Failed to sync cart:', error)
                    }
                } else if (sessionId) {
                    // Sync with session cart for guests
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Id': sessionId
                            },
                            credentials: 'include'
                        })

                        if (res.ok) {
                            const data = await res.json()
                            if (data?.items) {
                                const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                    product: {
                                        _id: item.product._id,
                                        name: item.product.name,
                                        price: item.product.price,
                                        image: item.product.image?.[0] || item.product.image
                                    },
                                    quantity: item.quantity,
                                    size: item.size,
                                    color: item.color
                                }))
                                set({ items: formattedItems })
                            }
                        }
                    } catch (error) {
                        console.error('Failed to sync session cart:', error)
                    }
                }
            },

            addItem: async (newItem, token) => {
                const { sessionId } = get()

                if (token) {
                    // Add to database cart for logged-in users
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: newItem.product._id,
                                quantity: newItem.quantity,
                                size: newItem.size,
                                color: newItem.color
                            })
                        })

                        if (!res.ok) throw new Error('Failed to add to cart')
                        const data = await res.json()

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                        }
                    } catch (error) {
                        console.error('Failed to add item:', error)
                        throw error
                    }
                } else {
                    const currentSessionId = sessionId || generateSessionId()
                    if (!sessionId) {
                        set({ sessionId: currentSessionId })
                    }

                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Id': currentSessionId
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: newItem.product._id,
                                quantity: newItem.quantity,
                                size: newItem.size,
                                color: newItem.color
                            })
                        })

                        if (!res.ok) {
                            const errorText = await res.text()
                            console.error('Session cart error response:', errorText)
                            throw new Error(`Failed to add to session cart: ${res.status} ${errorText}`)
                        }
                        const data = await res.json()

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                        } else {
                            set({ items: [] })
                        }
                    } catch (error) {
                        console.error('Failed to add to session cart:', error)
                        set((state) => {
                            const existingItemIndex = state.items.findIndex(
                                item =>
                                    item.product._id === newItem.product._id &&
                                    item.size === newItem.size &&
                                    item.color === newItem.color
                            )

                            if (existingItemIndex !== -1) {
                                const updatedItems = [...state.items]
                                updatedItems[existingItemIndex].quantity += newItem.quantity
                                return { items: updatedItems }
                            }
                            return { items: [...state.items, newItem] }
                        })
                    }
                }
            },

            removeFromCart: async (productId, token) => {
                const { sessionId } = get()

                if (token) {
                    // Remove from database cart for logged-in users
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include',
                            body: JSON.stringify({ productId })
                        })

                        const data = await res.json()

                        if (data.message === 'Cart deleted' || data.items?.length === 0) {
                            set({ items: [] })
                            return
                        }

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                            return
                        }

                        set((state) => ({
                            items: state.items.filter(item => item.product._id !== productId)
                        }))
                    } catch (error) {
                        console.error('Failed to remove item:', error)
                        set((state) => ({
                            items: state.items.filter(item => item.product._id !== productId)
                        }))
                    }
                } else if (sessionId) {
                    // Remove from session cart for guests
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Id': sessionId
                            },
                            credentials: 'include',
                            body: JSON.stringify({ productId })
                        })

                        const data = await res.json()

                        if (data.message === 'Cart deleted' || data.items?.length === 0) {
                            set({ items: [] })
                            return
                        }

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                            return
                        }

                        set((state) => ({
                            items: state.items.filter(item => item.product._id !== productId)
                        }))
                    } catch (error) {
                        console.error('Failed to remove from session cart:', error)
                        set((state) => ({
                            items: state.items.filter(item => item.product._id !== productId)
                        }))
                    }
                } else {
                    set((state) => ({
                        items: state.items.filter(item => item.product._id !== productId)
                    }))
                }
            },

            updateQuantity: async (productId, quantity, token) => {
                const { sessionId } = get()

                if (token) {
                    // Update database cart for logged-in users
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/update`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include',
                            body: JSON.stringify({ productId, quantity })
                        })

                        if (!res.ok) throw new Error('Failed to update quantity')
                        const data = await res.json()

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                        }
                    } catch (error) {
                        console.error('Failed to update quantity:', error)
                        throw error
                    }
                } else if (sessionId) {
                    // Update session cart for guests
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/update`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Id': sessionId
                            },
                            credentials: 'include',
                            body: JSON.stringify({ productId, quantity })
                        })

                        if (!res.ok) throw new Error('Failed to update session cart quantity')
                        const data = await res.json()

                        if (data?.items) {
                            const formattedItems: CartItem[] = data.items.map((item: any) => ({
                                product: {
                                    _id: item.product._id,
                                    name: item.product.name,
                                    price: item.product.price,
                                    image: item.product.image?.[0] || item.product.image
                                },
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                        }
                    } catch (error) {
                        console.error('Failed to update session cart quantity:', error)
                        set((state) => ({
                            items: state.items.map(item =>
                                item.product._id === productId ? { ...item, quantity } : item
                            )
                        }))
                    }
                } else {
                    set((state) => ({
                        items: state.items.map(item =>
                            item.product._id === productId ? { ...item, quantity } : item
                        )
                    }))
                }
            },

            setCart: (items) => set({ items }),
            clearCart: () => set({ items: [] })
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: false,
            partialize: (state) => ({
                items: state.items,
                sessionId: state.sessionId
            })
        }
    )
)
