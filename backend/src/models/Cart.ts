import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
    size?: string;
    color?: string;
}

export interface ICart extends Document {
    user?: mongoose.Types.ObjectId
    sessionId?: string
    items: ICartItem[]
}

const CartItemSchema: Schema = new Schema({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
})

const CartSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    sessionId: { type: String },
    items: [CartItemSchema],
})

export const Cart = mongoose.model<ICart>('Cart', CartSchema)
