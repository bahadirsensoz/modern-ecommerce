import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface CartItem {
    productId: string
    name: string
    price: number
    image: string
    quantity: number
    size?: string
    color?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (item: CartItem) => Promise<void>
    removeFromCart: (productId: string) => Promise<void>
    updateQuantity: (productId: string, quantity: number) => Promise<void>
    setCart: (items: CartItem[]) => void
    clearCart: () => void
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: async (newItem) => {
                const token = localStorage.getItem('token')

                if (token) {
                    try {
                        const res = await fetch('http://localhost:5000/api/cart/add', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: newItem.productId,
                                quantity: newItem.quantity,
                                size: newItem.size,
                                color: newItem.color
                            })
                        })

                        if (!res.ok) throw new Error('Failed to add to cart')
                        const data = await res.json()

                        if (data?.items) {
                            const formattedItems = data.items.map((item: any) => ({
                                productId: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                image: item.product.images?.[0] || item.product.image,
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
                    set((state) => {
                        const existingItemIndex = state.items.findIndex(
                            item =>
                                item.productId === newItem.productId &&
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
            },
            removeFromCart: async (productId) => {
                const token = localStorage.getItem('token')

                if (token) {
                    try {
                        const res = await fetch('http://localhost:5000/api/cart/remove', {
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
                            const formattedItems = data.items.map((item: any) => ({
                                productId: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                image: item.product.images?.[0] || item.product.image,
                                quantity: item.quantity,
                                size: item.size,
                                color: item.color
                            }))
                            set({ items: formattedItems })
                            return
                        }

                        set((state) => ({
                            items: state.items.filter(item => item.productId !== productId)
                        }))
                    } catch (error) {
                        console.error('Failed to remove item:', error)
                        set((state) => ({
                            items: state.items.filter(item => item.productId !== productId)
                        }))
                    }
                } else {
                    set((state) => ({
                        items: state.items.filter(item => item.productId !== productId)
                    }))
                }
            },
            updateQuantity: async (productId, quantity) => {
                const token = localStorage.getItem('token')

                if (token) {
                    try {
                        const res = await fetch('http://localhost:5000/api/cart/update', {
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
                            const formattedItems = data.items.map((item: any) => ({
                                productId: item.product._id,
                                name: item.product.name,
                                price: item.product.price,
                                image: item.product.images?.[0] || item.product.image,
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
                } else {
                    set((state) => ({
                        items: state.items.map(item =>
                            item.productId === productId ? { ...item, quantity } : item
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
                items: state.items
            })
        }
    )
)
