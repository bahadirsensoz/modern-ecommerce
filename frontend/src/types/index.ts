export type Product = {
    _id: string
    name: string
    description?: string
    price: number
    category?: string | { _id: string; name: string }
    image?: string
    images: string[]
}

export type Category = {
    _id: string
    name: string
    description: string
    image: string
}
