import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import categoryRoutes from './routes/category'
import productRoutes from './routes/product'
import userRoutes from './routes/user'
import cartRoutes from './routes/cart'
import orderRoutes from './routes/order'
import cookieParser from 'cookie-parser'
import { assignSessionId } from './middleware/sessionMiddleware'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(assignSessionId)
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)


app.get('/', (req, res) => {
    res.send('Backend is running')
})

mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`)
        })
    })
    .catch((err) => {
        console.error('MongoDB connection failed:', err)
    })
