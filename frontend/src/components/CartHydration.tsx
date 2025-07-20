'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cartStore'

export default function CartHydration() {
    const { setCart } = useCartStore()

    useEffect(() => {
        const fetchCart = async () => {
            const wasCleared = localStorage.getItem('cartCleared')
            if (wasCleared) {
                localStorage.removeItem('cartCleared')
                setCart([])
                return
            }

            const token = localStorage.getItem('token')

            try {
                const res = await fetch('http://localhost:5000/api/cart', {
                    headers: {
                        ...(token && {
                            Authorization: `Bearer ${token}`
                        })
                    },
                    credentials: 'include'
                })

                if (!res.ok) {
                    throw new Error('Failed to fetch cart')
                }

                const data = await res.json()

                if (!data?.items?.length) {
                    setCart([])
                    return
                }

                const formattedItems = data.items.map((item: any) => ({
                    productId: item.product._id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.image,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                }))

                setCart(formattedItems)
            } catch (error) {
                console.error('Failed to fetch cart:', error)
                setCart([])
            }
        }

        fetchCart()
    }, [setCart])

    return null
}
