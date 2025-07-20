import mongoose, { Schema, Document } from 'mongoose'

interface IOrderItem {
    product: mongoose.Types.ObjectId
    quantity: number
    size?: string
    color?: string
}

export interface IOrder extends Document {
    user?: mongoose.Types.ObjectId
    email: string
    sessionId?: string
    orderItems: IOrderItem[]
    shippingAddress: {
        fullName: string
        address: string
        city: string
        postalCode: string
        country: string
    }
    paymentMethod: string
    subtotal: number
    tax: number
    shipping: number
    totalPrice: number
    isPaid: boolean
    paidAt?: Date
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    createdAt: Date
}

const orderSchema = new Schema<IOrder>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        email: { type: String, required: true },
        sessionId: { type: String },
        orderItems: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                size: { type: String },
                color: { type: String }
            },
        ],
        shippingAddress: {
            fullName: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true },
        },
        paymentMethod: { type: String, required: true },
        subtotal: { type: Number, required: true },
        tax: { type: Number, required: true },
        shipping: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        status: {
            type: String,
            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
)

export const Order = mongoose.model<IOrder>('Order', orderSchema)
