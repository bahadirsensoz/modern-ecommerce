import mongoose, { Schema, Document } from 'mongoose'

export interface IUserActivity extends Document {
    user?: mongoose.Types.ObjectId
    sessionId?: string
    activityType: 'view' | 'purchase' | 'favorite' | 'cart_add' | 'search'
    productId?: mongoose.Types.ObjectId
    categoryId?: mongoose.Types.ObjectId
    searchQuery?: string
    metadata?: Record<string, any>
    createdAt: Date
}

const userActivitySchema = new Schema<IUserActivity>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        sessionId: { type: String },
        activityType: {
            type: String,
            enum: ['view', 'purchase', 'favorite', 'cart_add', 'search'],
            required: true
        },
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
        searchQuery: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
)

userActivitySchema.index({ user: 1, createdAt: -1 })
userActivitySchema.index({ sessionId: 1, createdAt: -1 })
userActivitySchema.index({ productId: 1, createdAt: -1 })
userActivitySchema.index({ categoryId: 1, createdAt: -1 })
userActivitySchema.index({ activityType: 1, createdAt: -1 })

export const UserActivity = mongoose.model<IUserActivity>('UserActivity', userActivitySchema) 