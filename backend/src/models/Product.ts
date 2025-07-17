import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        images: [String],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        variants: [
            {
                size: String,
                color: String,
            },
        ],
        tags: [String],
        isFeatured: { type: Boolean, default: false },
        specifications: { type: Object },
    },
    { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
