import mongoose from 'mongoose'

export type UserRole = 'customer' | 'admin'

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
        favorites: [String],
        emailVerified: { type: Boolean, default: false },
        verificationToken: String,
        verificationTokenExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date,
    },
    { timestamps: true }
)

export const User = mongoose.model('User', userSchema)
