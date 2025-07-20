import { Key } from "react"

export type Product = {
    _id: string
    name: string
    description?: string
    price: number
    category?: string | { _id: string; name: string }
    image?: string
    images: string[]
}

export type Category = {
    _id: string
    name: string
    description: string
    image: string
}

export interface OrderProduct {
    _id: string
    name: string
    price: number
    image?: string
}

export interface OrderItem {
    _id: Key | null | undefined
    product: OrderProduct
    quantity: number
    size?: string
    color?: string
}

export interface ShippingAddress {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
    label?: string
}

export interface Order {
    subtotal: number
    shipping: number
    tax: number
    _id: string
    user?: string
    email: string
    orderItems: OrderItem[]
    shippingAddress: ShippingAddress
    paymentMethod: string
    totalPrice: number
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    isPaid: boolean
    paidAt?: string
    createdAt: string
}
