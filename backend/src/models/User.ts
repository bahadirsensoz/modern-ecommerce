import mongoose, { Document, Types } from 'mongoose'

export type UserRole = 'customer' | 'admin'

interface IAddress {
    label?: string
    street?: string
    city?: string
    country?: string
    postalCode?: string
    isDefault: boolean
}

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId
    email: string
    password: string
    firstName?: string
    lastName?: string
    phone?: string
    role: UserRole
    addresses: IAddress[]
    favorites: Types.ObjectId[]
    emailVerified: boolean
    verificationToken?: string
    verificationTokenExpires?: Date
    resetPasswordToken?: string
    resetPasswordExpires?: Date
    createdAt: Date
    updatedAt: Date
}

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String },
        role: {
            type: String,
            enum: ['customer', 'admin'],
            default: 'customer',
        },
        addresses: [
            {
                label: String,
                street: String,
                city: String,
                country: String,
                postalCode: String,
                isDefault: { type: Boolean, default: false },
            }
        ],
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        emailVerified: { type: Boolean, default: false },
        verificationToken: String,
        verificationTokenExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    { timestamps: true }
)

export const User = mongoose.model<IUser>('User', userSchema)
