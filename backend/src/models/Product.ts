import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

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
        reviews: [reviewSchema],
        rating: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
)

export const Product = mongoose.model('Product', productSchema)
