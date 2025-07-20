'use client'

import { useCartStore } from '@/store/cartStore'
import { calculatePrices } from '@/utils/priceCalculations'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

interface Address {
    _id: string
    label: string
    street: string
    city: string
    postalCode: string
    country: string
    isDefault: boolean
}

export default function CheckoutPage() {
    const router = useRouter()
    const { items, clearCart } = useCartStore()
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [addresses, setAddresses] = useState<Address[]>([])
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [saveAddress, setSaveAddress] = useState(false)
    const [userEmail, setUserEmail] = useState('')
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
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)

        const fetchUserData = async () => {
            if (!token) return

            try {
                const res = await fetch('http://localhost:5000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    credentials: 'include'
                })

                if (!res.ok) throw new Error('Failed to fetch user data')

                const userData = await res.json()
                setForm(prev => ({
                    ...prev,
                    email: userData.email,
                    fullName: `${userData.firstName} ${userData.lastName}`.trim()
                }))

                if (userData?.addresses && Array.isArray(userData.addresses)) {
                    setAddresses(userData.addresses)
                    const defaultAddr = userData.addresses.find((addr: { isDefault: any }) => addr.isDefault)
                    if (defaultAddr) {
                        setSelectedAddressId(defaultAddr._id)
                        setForm(prev => ({
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
    }, [])

    const handleAddressChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = e.target.value
        if (addressId === 'new') {
            setSelectedAddressId(null)
            setForm(prev => ({
                ...prev,
                label: '',
                street: '',
                city: '',
                postalCode: '',
                country: ''
            }))
            return
        }

        const selected = addresses.find(addr => addr._id === addressId)
        if (selected) {
            setSelectedAddressId(selected._id)
            setForm(prev => ({
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
            const token = localStorage.getItem('token')
            const prices = calculatePrices(items)

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
                items: items.map(item => ({
                    product: item.productId,
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color
                })),
                subtotal: prices.subtotal,
                tax: prices.tax,
                shipping: prices.shipping,
                totalPrice: prices.total
            }

            console.log('Sending order with:', orderBody)

            if (isLoggedIn && saveAddress && !selectedAddressId) {
                try {
                    const res = await fetch('http://localhost:5000/api/users/me/addresses', {
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

            const res = await axios.post(
                'http://localhost:5000/api/orders',
                orderBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    withCredentials: true
                }
            )

            const responseData = res.data
            console.log('Order response:', responseData)

            clearCart()
            router.push(`/orders/${responseData._id}`)
        } catch (err: any) {
            console.error('Order error:', err)
            setError(err.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    const handlePlaceOrder = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')

            if (!token) {
                console.error('No auth token found')
            }

            console.log('Placing order with token:', !!token)

            const { data } = await axios.post(
                'http://localhost:5000/api/orders',
                {
                    shippingAddress: {
                        fullName: form.fullName,
                        address: form.street,
                        city: form.city,
                        postalCode: form.postalCode,
                        country: form.country,
                        label: form.label || 'Default Address'
                    },
                    paymentMethod: form.paymentMethod,
                    email: form.email,
                    items: items.map(item => ({
                        product: item.productId,
                        quantity: item.quantity,
                        size: item.size,
                        color: item.color
                    }))
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                }
            )

            const responseData = data
            console.log('Order response:', responseData)

            clearCart()
            router.push(`/orders/${responseData._id}`)
        } catch (error: any) {
            console.error('Order placement failed:', error)
            setError(error.response?.data?.message || 'Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            {error && (
                <p className="text-red-600 border border-red-500 bg-red-100 p-2 mb-4">
                    {error}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                    {!isLoggedIn ? (
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address for Order Confirmation"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                    ) : (
                        <div className="p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">Order confirmation will be sent to: </span>
                            <span className="font-medium">{form.email}</span>
                        </div>
                    )}

                    {/* Full Name field */}
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={e => setForm({ ...form, fullName: e.target.value })}
                        required
                        className="w-full border p-2 rounded"
                    />

                    {/* Existing address selection if logged in */}
                    {isLoggedIn && addresses.length > 0 && (
                        <div className="mb-6">
                            <label className="block mb-2 font-semibold">Select Shipping Address</label>
                            <select
                                value={selectedAddressId || 'new'}
                                onChange={handleAddressChange}
                                className="w-full border p-2 rounded mb-4"
                            >
                                <option value="new">Add New Address</option>
                                {addresses.map(addr => (
                                    <option key={addr._id} value={addr._id}>
                                        {addr.label || 'Unlabeled'} - {addr.street}, {addr.city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Rest of the address fields */}
                    <div className="space-y-4">
                        {!selectedAddressId && (
                            <input
                                type="text"
                                name="label"
                                placeholder="Address Label (e.g., Home, Work)"
                                value={form.label}
                                onChange={e => setForm({ ...form, label: e.target.value })}
                                className="w-full border p-2 rounded"
                            />
                        )}
                        <input
                            type="text"
                            name="street"
                            placeholder="Street Address"
                            value={form.street}
                            onChange={e => setForm({ ...form, street: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="postalCode"
                            placeholder="Postal Code"
                            value={form.postalCode}
                            onChange={e => setForm({ ...form, postalCode: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={e => setForm({ ...form, country: e.target.value })}
                            required
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    {isLoggedIn && !selectedAddressId && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="saveAddress"
                                checked={saveAddress}
                                onChange={e => setSaveAddress(e.target.checked)}
                                className="rounded"
                            />
                            <label htmlFor="saveAddress">Save this address for future use</label>
                        </div>
                    )}
                </div>

                <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full border p-2 rounded"
                >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                </select>

                {/* Price Summary */}
                <div className="mt-6 border-t pt-4 space-y-2">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    {items.map(item => (
                        <div key={item.productId} className="flex justify-between">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${calculatePrices(items).subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (18%):</span>
                            <span>${calculatePrices(items).tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span>${calculatePrices(items).shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>${calculatePrices(items).total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 disabled:bg-gray-400"
                >
                    {loading ? 'Placing Order...' : 'Place Order'}
                </button>
            </form>
        </div>
    )
}
