'use client'

import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import { useEffect } from 'react'

export default function CartPage() {
    const { items, removeFromCart, updateQuantity } = useCartStore()

    const handleRemoveItem = async (productId: string) => {
        const token = localStorage.getItem('token')

        if (token) {
            try {
                const res = await fetch('http://localhost:5000/api/cart/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ productId }),
                })

                if (!res.ok) {
                    const error = await res.text()
                    console.error('Failed to remove from cart:', error)
                    alert('Could not remove item from server-side cart.')
                    return
                }
            } catch (err) {
                console.error('Server error removing from cart:', err)
            }
        }

        removeFromCart(productId)
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * 0.18
    const shipping = items.length > 0 ? 50 : 0
    const total = subtotal + tax + shipping

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>

            {items.length === 0 ? (
                <p>Your cart is empty. <Link href="/">Go shopping</Link></p>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.productId} className="flex justify-between items-center border p-2">
                            <div className="flex items-center gap-4">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover border" />
                                <div>
                                    <p className="font-bold">{item.name}</p>
                                    <p>₺{item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e) =>
                                        updateQuantity(item.productId, parseInt(e.target.value))
                                    }
                                    className="w-12 border text-center"
                                />
                                <button
                                    onClick={() => handleRemoveItem(item.productId)}
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
