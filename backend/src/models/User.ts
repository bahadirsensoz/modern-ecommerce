import mongoose from 'mongoose'

export type UserRole = 'customer' | 'admin'

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        phone: { type: String },
        role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
        addresses: [
            {
                street: String,
                city: String,
                country: String,
                postalCode: String,
            },
        ],
        favorites: [String], // category ids or product ids
        emailVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
