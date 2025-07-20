export const TAX_RATE = 0.18
export const SHIPPING_COST = 50

export interface CartItem {
    productId: string
    price: number
    quantity: number
    name: string
}

export interface PriceBreakdown {
    subtotal: number
    tax: number
    shipping: number
    total: number
}

export const calculatePrices = (items: CartItem[]): PriceBreakdown => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * TAX_RATE
    const shipping = items.length > 0 ? SHIPPING_COST : 0
    const total = subtotal + tax + shipping

    return {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        shipping: shipping,
        total: Number(total.toFixed(2))
    }
}