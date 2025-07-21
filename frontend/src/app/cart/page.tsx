'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { useEffect } from 'react'
import { calculatePrices } from '@/utils/priceCalculations'

export default function CartPage() {
    const { items, removeFromCart, updateQuantity } = useCartStore()
    const { isAuthenticated, token } = useAuthStore()

    const handleRemoveItem = async (productId: string) => {
        try {
            await useCartStore.getState().removeFromCart(productId, token || undefined)
        } catch (error) {
            console.error('Failed to remove item:', error)
        }
    }

    const handleUpdateQuantity = async (productId: string, quantity: number) => {
        try {
            await useCartStore.getState().updateQuantity(productId, quantity, token || undefined)
        } catch (error) {
            console.error('Failed to update quantity:', error)
        }
    }

    const { subtotal, tax, shipping, total } = calculatePrices(items.map(item => ({
        productId: item.product._id,
        price: item.product.price,
        name: item.product.name,
        quantity: item.quantity
    })))

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

            {items.length === 0 ? (
                <p>Your cart is empty. <Link href="/">Go shopping</Link></p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.product._id} className="flex justify-between items-center border p-2">
                            <div className="flex items-center gap-4">
                                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover border" />
                                <div>
                                    <p className="font-bold">{item.product.name}</p>
                                    <p>₺{item.product.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e) =>
                                        handleUpdateQuantity(item.product._id, parseInt(e.target.value))
                                    }
                                    className="w-12 border text-center"
                                />
                                <button
                                    onClick={() => handleRemoveItem(item.product._id)}
                                    className="text-red-600 font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 border-t pt-4 text-right">
                        <p>Subtotal: ₺{subtotal.toFixed(2)}</p>
                        <p>Tax (18%): ₺{tax.toFixed(2)}</p>
                        <p>Shipping: ₺{shipping.toFixed(2)}</p>
                        <p className="font-bold text-xl">Total: ₺{total.toFixed(2)}</p>
                        <Link
                            href="/checkout"
                            className="inline-block mt-4 bg-black text-white px-4 py-2 border"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
