'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { calculatePrices } from '@/utils/priceCalculations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Address } from '@/types'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart, sessionId } = useCartStore()
  const { isAuthenticated, token } = useAuthStore()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [saveAddress, setSaveAddress] = useState(false)
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    label: '',
    street: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'Credit Card'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoggedIn(isAuthenticated)

    const fetchUserData = async () => {
      if (!isAuthenticated || !token) return

      logTokenInfo(token, 'CheckoutFetchUser')

      if (!isValidJWT(token)) {
        console.error('Invalid JWT token in CheckoutFetchUser')
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })

        if (!res.ok) throw new Error('Failed to fetch user data')

        const userData = await res.json()
        setForm((prev) => ({
          ...prev,
          email: userData.email,
          fullName: `${userData.firstName} ${userData.lastName}`.trim()
        }))

        if (userData?.addresses && Array.isArray(userData.addresses)) {
          setAddresses(userData.addresses)
          const defaultAddr = userData.addresses.find((addr: Address & { isDefault: boolean }) => addr.isDefault)
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr._id)
            setForm((prev) => ({
              ...prev,
              label: defaultAddr.label || '',
              street: defaultAddr.street || '',
              city: defaultAddr.city || '',
              postalCode: defaultAddr.postalCode || '',
              country: defaultAddr.country || ''
            }))
          }
        }
      } catch (err) {
        console.error('Failed to load user data:', err)
      }
    }

    fetchUserData()
  }, [isAuthenticated, token])

  const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addressId = e.target.value
    if (addressId === 'new') {
      setSelectedAddressId(null)
      setForm((prev) => ({
        ...prev,
        label: '',
        street: '',
        city: '',
        postalCode: '',
        country: ''
      }))
      return
    }

    const selected = addresses.find((addr) => addr._id === addressId)
    if (selected && selected._id) {
      setSelectedAddressId(selected._id)
      setForm((prev) => ({
        ...prev,
        label: selected.label || '',
        street: selected.street || '',
        city: selected.city || '',
        postalCode: selected.postalCode || '',
        country: selected.country || ''
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isLoggedIn) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(form.email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }
    }

    try {
      const prices = calculatePrices(items.map((item) => ({
        productId: item.product._id,
        price: item.product.price,
        name: item.product.name,
        quantity: item.quantity
      })))

      const orderBody = {
        email: form.email,
        shippingAddress: {
          fullName: form.fullName,
          address: form.street,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country,
          label: form.label || 'Default Address'
        },
        paymentMethod: form.paymentMethod,
        items: items.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        subtotal: prices.subtotal,
        tax: prices.tax,
        shipping: prices.shipping,
        totalPrice: prices.total
      }

      if (isLoggedIn && saveAddress && !selectedAddressId) {
        try {
          if (!isAuthenticated || !token) {
            console.error('No authentication token found for saving address')
            return
          }

          logTokenInfo(token, 'CheckoutSaveAddress')

          if (!isValidJWT(token)) {
            console.error('Invalid JWT token in CheckoutSaveAddress')
            return
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/addresses`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify({
              addresses: [
                ...addresses,
                {
                  label: form.label,
                  street: form.street,
                  city: form.city,
                  postalCode: form.postalCode,
                  country: form.country,
                  isDefault: addresses.length === 0
                }
              ]
            })
          })

          if (!res.ok) {
            console.error('Failed to save address')
          }
        } catch (err) {
          console.error('Failed to save address:', err)
        }
      }

      if (isAuthenticated && !token) {
        setError('Authentication error. Please login again.')
        setLoading(false)
        return
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        orderBody,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(isAuthenticated && token ? { Authorization: `Bearer ${token}` } : {}),
            ...(!isAuthenticated && sessionId ? { 'X-Session-Id': sessionId } : {})
          },
          withCredentials: true
        }
      )

      const responseData = res.data

      clearCart()
      router.push(`/orders/${responseData._id}`)
    } catch (err: unknown) {
      console.error('Order error:', err)
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const prices = calculatePrices(items.map((item) => ({
    productId: item.product._id,
    price: item.product.price,
    name: item.product.name,
    quantity: item.quantity
  })))

  return (
    <div className="page-shell max-w-6xl space-y-6">
      <div className="space-y-2">
        <p className="pill w-fit">Secure checkout</p>
        <h1 className="headline">Confirm your order</h1>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="section space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Contact</h2>
            {!isLoggedIn ? (
              <input
                type="email"
                name="email"
                placeholder="Email address for confirmation"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="input"
              />
            ) : (
              <div className="surface rounded-xl p-3 text-sm text-gray-700">
                Order confirmation will be sent to <span className="font-semibold text-gray-900">{form.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Shipping details</h2>
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
              className="input"
            />

            {isLoggedIn && addresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-200">Saved addresses</label>
                <select
                  value={selectedAddressId || 'new'}
                  onChange={handleAddressChange}
                  className="input"
                >
                  <option value="new">Add new address</option>
                  {addresses.map((addr) => (
                    <option key={addr._id} value={addr._id}>
                      {addr.label || 'Unlabeled'} - {addr.street}, {addr.city}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedAddressId && (
              <input
                type="text"
                name="label"
                placeholder="Address label (e.g., Home, Work)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="input"
              />
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="text"
                name="street"
                placeholder="Street address"
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                required
                className="input"
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                className="input"
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal code"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                required
                className="input"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
                className="input"
              />
            </div>

            {isLoggedIn && !selectedAddressId && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-transparent"
                />
                Save this address for later
              </label>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Payment</h2>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="input"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>
        </div>

        <div className="section space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
          <div className="space-y-2 text-sm text-gray-700">
            {items.map((item) => (
              <div key={item.product._id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>${prices.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax (18%)</span><span>${prices.tax.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>${prices.shipping.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>${prices.total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary-btn w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}
