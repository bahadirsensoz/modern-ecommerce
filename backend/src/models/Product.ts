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
        },
        isApproved: {
            type: Boolean,
            default: false
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
                type: mongoose.Schema.Types.Mixed,
                default: {},
            },
        ],
        tags: [String],
        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
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
