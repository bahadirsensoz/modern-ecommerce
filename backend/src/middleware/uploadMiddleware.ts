import { Request } from 'express'
import multer from 'multer'


const storage = multer.memoryStorage()

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('Not an image! Please upload only images.'), false)
    }
}

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 10240 // 5MB limit
    }
})