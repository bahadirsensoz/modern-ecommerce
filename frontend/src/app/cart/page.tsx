'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { calculatePrices } from '@/utils/priceCalculations'

export default function CartPage() {
  const { items } = useCartStore()
  const { token } = useAuthStore()

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

  const { subtotal, tax, shipping, total } = calculatePrices(items.map((item) => ({
    productId: item.product._id,
    price: item.product.price,
    name: item.product.name,
    quantity: item.quantity
  })))

  return (
    <div className="page-shell max-w-5xl space-y-6">
      <div className="space-y-2">
        <p className="pill w-fit">Your bag</p>
        <h1 className="headline">Shopping cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="section text-center">
          <p className="text-slate-300">Your cart is empty.</p>
          <Link href="/" className="primary-btn mt-4 inline-flex">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="section space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">${item.product.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    onChange={(e) =>
                      handleUpdateQuantity(item.product._id, parseInt(e.target.value))
                    }
                    className="input w-16 px-2 text-center"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.product._id)}
                    className="ghost-btn px-3 py-2 text-sm text-rose-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="section space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Order summary</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              className="primary-btn w-full justify-center text-center"
            >
              Proceed to checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
