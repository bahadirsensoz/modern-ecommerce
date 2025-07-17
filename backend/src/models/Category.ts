import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        image: String,
        isActive: { type: Boolean, default: true },
        sortOrder: { type: Number, default: 0 },
    },
    { timestamps: true }
)

export const Category = mongoose.model('Category', categorySchema)
