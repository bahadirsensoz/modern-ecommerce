import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Cart, CartItem } from '@/types'

const parseSizeToOptions = (size?: string): Record<string, string> => {
    if (!size || typeof size !== 'string') return {}
    return size
        .split('|')
        .map((part) => part.split(':'))
        .filter((pair): pair is [string, string] => pair.length === 2 && Boolean(pair[0]) && Boolean(pair[1]))
        .reduce<Record<string, string>>((acc, [k, v]) => {
            acc[k] = v
            return acc
        }, {})
}

const buildVariantKey = (item: Partial<CartItem>) => {
    const entries: Array<[string, string]> = []

    const parsedSizeOptions = parseSizeToOptions(item.size)
    const optionMap = new Map<string, string>()

    if (item.color) optionMap.set('color', item.color)
    Object.entries(parsedSizeOptions).forEach(([k, v]) => optionMap.set(k, v))

    if (item.variantOptions) {
        Object.entries(item.variantOptions)
            .filter(([, v]) => Boolean(v))
            .forEach(([k, v]) => optionMap.set(k, String(v)))
    }

    Array.from(optionMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([k, v]) => entries.push([k, v]))

    return entries.length ? entries.map(([k, v]) => `${k}:${v}`).join('|') : 'default'
}

interface CartStore {
    items: CartItem[]
    sessionId: string | null
    addItem: (item: CartItem, token?: string) => Promise<void>
    removeFromCart: (productId: string, variantKey?: string, token?: string) => Promise<void>
    updateQuantity: (productId: string, quantity: number, variantKey?: string, token?: string) => Promise<void>
    setCart: (items: CartItem[]) => void
    clearCart: () => void
    setSessionId: (sessionId: string) => void
    syncCart: (token?: string) => Promise<void>
}

const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

interface ApiCartItem {
    product: {
        _id: string
        name: string
        price: number
        image?: string | string[]
        images?: string[]
    }
    quantity: number
    size?: string
    color?: string
    variantOptions?: Record<string, string>
    variantKey?: string
}

const matchItem = (a: CartItem, b: Partial<CartItem>) =>
    a.product._id === b.product?._id &&
    (a.size || '') === (b.size || '') &&
    (a.color || '') === (b.color || '') &&
    (a.variantKey || '') === (b.variantKey || '')

const sizePayloadFromVariant = (item: Partial<CartItem>) => {
    if (item.size) return item.size
    if (item.variantOptions) {
        const filtered = Object.entries(item.variantOptions).filter(([k]) => k !== 'color')
        if (filtered.length) {
            return filtered.map(([k, v]) => `${k}:${v}`).join('|')
        }
    }
    return undefined
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
                                const currentItems = get().items
                                const formattedItems: CartItem[] = data.items
                                    .filter((item: ApiCartItem) => item?.product)
                                    .map((item: ApiCartItem) => {
                                        const parsedOptions = item.variantOptions || parseSizeToOptions(item.size)
                                        return {
                                            product: {
                                                _id: item.product._id,
                                                name: item.product.name,
                                                price: item.product.price,
                                                image: Array.isArray(item.product.image)
                                                    ? item.product.image[0]
                                                    : item.product.image ?? item.product.images?.[0]
                                            },
                                            quantity: item.quantity,
                                            size: item.size,
                                            color: item.color,
                                            variantOptions: Object.keys(parsedOptions).length ? parsedOptions : undefined,
                                            variantKey: item.variantKey || buildVariantKey({ size: item.size, color: item.color, variantOptions: parsedOptions })
                                        }
                                    })
                                // preserve variantOptions/keys if missing from API by matching existing
                                const merged = formattedItems.map(fi => {
                                    const found = currentItems.find(ci => matchItem(ci, fi))
                                    return found ? { ...fi, variantOptions: found.variantOptions, variantKey: found.variantKey || fi.variantKey } : fi
                                })
                                set({ items: merged })
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
                                const currentItems = get().items
                                const formattedItems: CartItem[] = data.items
                                    .filter((item: ApiCartItem) => item?.product)
                                    .map((item: ApiCartItem) => {
                                        const parsedOptions = item.variantOptions || parseSizeToOptions(item.size)
                                        return {
                                            product: {
                                                _id: item.product._id,
                                                name: item.product.name,
                                                price: item.product.price,
                                                image: Array.isArray(item.product.image)
                                                    ? item.product.image[0]
                                                    : item.product.image ?? item.product.images?.[0]
                                            },
                                            quantity: item.quantity,
                                            size: item.size,
                                            color: item.color,
                                            variantOptions: Object.keys(parsedOptions).length ? parsedOptions : undefined,
                                            variantKey: item.variantKey || buildVariantKey({ size: item.size, color: item.color, variantOptions: parsedOptions })
                                        }
                                    })
                                const merged = formattedItems.map(fi => {
                                    const found = currentItems.find(ci => matchItem(ci, fi))
                                    return found ? { ...fi, variantOptions: found.variantOptions, variantKey: found.variantKey || fi.variantKey } : fi
                                })
                                set({ items: merged })
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
                        const payloadSize = sizePayloadFromVariant(newItem)
                        const parsedOptions = newItem.variantOptions || parseSizeToOptions(payloadSize)
                        const normalized = {
                            ...newItem,
                            size: payloadSize,
                            variantOptions: Object.keys(parsedOptions).length ? parsedOptions : undefined
                        }
                        const normalizedKey = newItem.variantKey || buildVariantKey({ ...normalized })
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: newItem.product._id,
                                quantity: newItem.quantity,
                                size: payloadSize,
                                color: newItem.color
                            })
                        })

                        set((state) => {
                            const normalizedItem = { ...normalized, variantKey: normalizedKey }
                            const existingIndex = state.items.findIndex(ci => matchItem(ci, normalizedItem))
                            if (existingIndex !== -1) {
                                const updated = [...state.items]
                                updated[existingIndex].quantity += newItem.quantity
                                return { items: updated }
                            }
                            return { items: [...state.items, normalizedItem] }
                        })
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
                        const payloadSize = sizePayloadFromVariant(newItem)
                        const parsedOptions = newItem.variantOptions || parseSizeToOptions(payloadSize)
                        const normalizedNew = {
                            ...newItem,
                            size: payloadSize,
                            variantOptions: Object.keys(parsedOptions).length ? parsedOptions : undefined
                        }
                        const normalizedKey = newItem.variantKey || buildVariantKey({ ...normalizedNew })
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-Session-Id': currentSessionId
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: newItem.product._id,
                                quantity: newItem.quantity,
                                size: payloadSize,
                                color: newItem.color
                            })
                        })

                        set((state) => {
                            const normalizedItem = { ...normalizedNew, variantKey: normalizedKey }
                            const existingItemIndex = state.items.findIndex(item => matchItem(item, normalizedItem))

                            if (existingItemIndex !== -1) {
                                const updatedItems = [...state.items]
                                updatedItems[existingItemIndex].quantity += newItem.quantity
                                return { items: updatedItems }
                            }
                            return { items: [...state.items, normalizedItem] }
                        })
                    } catch (error) {
                        console.error('Failed to add to session cart:', error)
                        set((state) => {
                            const parsedOptions = newItem.variantOptions || parseSizeToOptions(newItem.size)
                            const normalizedNew = {
                                ...newItem,
                                variantOptions: Object.keys(parsedOptions).length ? parsedOptions : undefined,
                                variantKey: newItem.variantKey || buildVariantKey({ ...newItem, variantOptions: parsedOptions })
                            }
                            const existingItemIndex = state.items.findIndex(
                                item => matchItem(item, normalizedNew)
                            )

                            if (existingItemIndex !== -1) {
                                const updatedItems = [...state.items]
                                updatedItems[existingItemIndex].quantity += newItem.quantity
                                return { items: updatedItems }
                            }
                            return { items: [...state.items, normalizedNew] }
                        })
                    }
                }
            },

            removeFromCart: async (productId, variantKey, token) => {
                const { sessionId } = get()
                const remainingItems = get().items.filter(item => {
                    const key = item.variantKey || buildVariantKey(item)
                    return !(item.product._id === productId && (!variantKey || key === variantKey))
                })

                const readdItems = async (itemsToAdd: CartItem[]) => {
                    for (const rem of itemsToAdd) {
                        const payloadSize = sizePayloadFromVariant(rem)
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                ...(!token && sessionId ? { 'X-Session-Id': sessionId } : {})
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: rem.product._id,
                                quantity: rem.quantity,
                                size: payloadSize,
                                color: rem.color
                            })
                        })
                    }
                }

                const doRemove = async () => {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            ...(!token && sessionId ? { 'X-Session-Id': sessionId } : {})
                        },
                        credentials: 'include',
                        body: JSON.stringify({ productId })
                    })
                }

                try {
                    await doRemove()
                    if (remainingItems.length > 0) {
                        await readdItems(remainingItems)
                    }
                    set({ items: remainingItems })
                } catch (error) {
                    console.error('Failed to remove item:', error)
                    set({ items: remainingItems })
                }
            },

            updateQuantity: async (productId, quantity, variantKey, token) => {
                const { sessionId } = get()
                const updatedItems = get().items.map(item => {
                    const key = item.variantKey || buildVariantKey(item)
                    if (item.product._id === productId && (!variantKey || key === variantKey)) {
                        return { ...item, quantity }
                    }
                    return item
                })

                const itemsForProduct = updatedItems.filter(i => i.product._id === productId)

                const readdItems = async () => {
                    for (const itm of itemsForProduct) {
                        const payloadSize = sizePayloadFromVariant(itm)
                        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/add`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                ...(!token && sessionId ? { 'X-Session-Id': sessionId } : {})
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                productId: itm.product._id,
                                quantity: itm.quantity,
                                size: payloadSize,
                                color: itm.color
                            })
                        })
                    }
                }

                try {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/remove`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            ...(!token && sessionId ? { 'X-Session-Id': sessionId } : {})
                        },
                        credentials: 'include',
                        body: JSON.stringify({ productId })
                    })

                    if (itemsForProduct.length > 0) {
                        await readdItems()
                    }
                    set({ items: updatedItems })
                } catch (error) {
                    console.error('Failed to update quantity:', error)
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
