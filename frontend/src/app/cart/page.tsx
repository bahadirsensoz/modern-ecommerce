'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { calculatePrices } from '@/utils/priceCalculations'
import Image from 'next/image'

export default function CartPage() {
  const { items } = useCartStore()
  const { token } = useAuthStore()

  const handleRemoveItem = async (productId: string, variantKey?: string) => {
    try {
      await useCartStore.getState().removeFromCart(productId, variantKey, token || undefined)
    } catch (error) {
      console.error('Failed to remove item:', error)
    }
  }

  const handleUpdateQuantity = async (productId: string, quantity: number, variantKey?: string) => {
    try {
      await useCartStore.getState().updateQuantity(productId, quantity, variantKey, token || undefined)
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

  const flattenVariantEntries = (data: Record<string, unknown>): Array<[string, string]> => {
    const map = new Map<string, string>()

    if (typeof data.variantOptions === 'object' && data.variantOptions) {
      Object.entries(data.variantOptions as Record<string, unknown>)
        .filter(([, v]) => Boolean(v))
        .forEach(([k, v]) => map.set(k, String(v)))
    }

    if (typeof data.color === 'string' && data.color) {
      map.set('color', data.color)
    }

    if (typeof data.size === 'string' && data.size) {
      const parts = data.size.split('|').map((p) => p.split(':')).filter((pair) => pair.length === 2)
      if (parts.length) {
        parts.forEach(([k, v]) => {
          if (k && v && !map.has(k)) map.set(k, v)
        })
      } else if (!map.has('size')) {
        map.set('size', data.size)
      }
    }

    return Array.from(map.entries())
  }

  return (
    <div className="page-shell max-w-5xl space-y-6">
      <div className="space-y-2">
        <p className="pill w-fit">Your bag</p>
        <h1 className="headline dark:text-white">Shopping cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="section text-center dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">Your cart is empty.</p>
          <Link href="/" className="primary-btn mt-4 inline-flex">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="section space-y-4">
            {items.map((item, idx) => {
              const variantEntries = flattenVariantEntries(item as unknown as Record<string, unknown>)
              const computedVariantKey = item.variantKey || variantEntries.map(([k, v]) => `${k}:${v}`).join('|')
              const itemKey = `${item.product._id}-${idx}-${computedVariantKey}`
              return (
                <div key={itemKey} className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-gray-100">
                      <Image
                        src={item.product.image || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">${item.product.price.toFixed(2)}</p>
                      {variantEntries.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                          {variantEntries.map(([key, value]) => (
                            <span key={`${key}-${value}`} className="pill dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-slate-700">
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, Math.max(1, item.quantity - 1), computedVariantKey || undefined)}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /></svg>
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1, computedVariantKey || undefined)}
                        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product._id, computedVariantKey || undefined)}
                      className="ghost-btn px-3 py-2 text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="section space-y-3 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order summary</h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${shipping.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900 dark:border-slate-700 dark:text-white">
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
