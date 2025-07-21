export interface Review {
    _id: string
    user: {
        _id: string
        firstName: string
        lastName: string
    }
    rating: number
    comment: string
    isApproved: boolean
    createdAt: string
    updatedAt: string
}

export interface Product {
    _id: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    category: {
        _id: string
        name: string
        description?: string
    }
    variants: Array<Record<string, string>> // allow dynamic variant keys
    tags: string[]
    isFeatured: boolean
    isActive: boolean
    specifications: Record<string, unknown>
    reviews: Review[]
    rating: number
    createdAt: string
    updatedAt: string
}

export interface Category {
    _id: string
    name: string
    description?: string
    image?: string
    isActive: boolean
    sortOrder: number
    createdAt: string
    updatedAt: string
}

export interface Address {
    _id?: string
    label?: string
    street?: string
    city?: string
    country?: string
    postalCode?: string
    isDefault: boolean
}

export interface User {
    _id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    role: 'customer' | 'admin'
    addresses: Address[]
    favorites: string[] | Product[]
    emailVerified: boolean
    createdAt: string
    updatedAt: string
}

export interface CartItem {
    product: {
        _id: string
        name: string
        price: number
        image?: string
    }
    quantity: number
    size?: string
    color?: string
}

export interface Cart {
    _id: string
    user?: string | User
    sessionId?: string
    items: CartItem[]
}

export interface OrderItem extends CartItem {
    _id: string
}

export interface ShippingAddress {
    fullName: string
    address: string
    city: string
    postalCode: string
    country: string
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Order {
    _id: string
    user?: string | User
    email: string
    sessionId?: string
    orderItems: OrderItem[]
    shippingAddress: ShippingAddress
    paymentMethod: string
    subtotal: number
    tax: number
    shipping: number
    totalPrice: number
    isPaid: boolean
    paidAt?: string
    status: OrderStatus
    createdAt: string
    updatedAt: string
}

export interface ApiError {
    message: string
    status?: number
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
}
