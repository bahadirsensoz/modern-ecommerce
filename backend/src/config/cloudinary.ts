import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
    try {
        const b64 = Buffer.from(file.buffer).toString('base64')
        const dataURI = `data:${file.mimetype};base64,${b64}`

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'products',
            resource_type: 'auto'
        })

        return result.secure_url
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw new Error('Failed to upload image')
    }
}

export default cloudinary