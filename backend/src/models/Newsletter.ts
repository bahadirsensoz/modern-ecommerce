import mongoose from 'mongoose'

const newsletterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    subscribedAt: {
        type: Date,
        default: Date.now
    },
    unsubscribedAt: {
        type: Date,
        default: null,
        required: false
    }
}, {
    timestamps: true
})

export const Newsletter = mongoose.model('Newsletter', newsletterSchema) 