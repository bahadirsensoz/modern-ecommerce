import { Request } from 'express'
import multer from 'multer'
import path from 'path'


const storage = multer.memoryStorage()

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (
        file.mimetype.startsWith('image/') &&
        allowedExtensions.includes(ext)
    ) {
        cb(null, true)
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 10240 // 5MB limit
    }
})