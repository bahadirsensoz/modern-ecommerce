import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Category } from '../models/Category'
import { Product } from '../models/Product'
import cloudinary from '../config/cloudinary'

dotenv.config()

type ProductTemplate = {
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    variantOptions: Record<string, string[]>
    specifications?: Record<string, string | number>
}

// Helper to generate cartesian product of two arrays
function cartesianProduct<T, U>(a: T[], b: U[]): Array<T & U> {
    const result: Array<any> = []
    for (const aVal of a) {
        for (const bVal of b) {
            result.push({ ...aVal, ...bVal })
        }
    }
    return result
}

const normalizeCategoryName = (name: string) =>
    name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/&/g, 'and')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

// Canonical category name -> product templates
const productTemplates: Record<string, ProductTemplate[]> = {
    electronics: [
        {
            name: 'Apple iPhone 15 Pro',
            description: 'Flagship Apple smartphone with A17 Pro chip and ProMotion display.',
            price: 1199,
            stock: 25,
            images: [
                'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                color: ['Natural Titanium', 'Black Titanium'],
                storage: ['128GB', '256GB']
            }
        },
        {
            name: 'Samsung Galaxy S24 Ultra',
            description: 'Premium Samsung device with 200MP camera and S Pen support.',
            price: 1249,
            stock: 20,
            images: [
                'https://images.pexels.com/photos/1092644/pexels-photo-1092644.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/127905/pexels-photo-127905.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                color: ['Titanium Gray', 'Titanium Violet'],
                storage: ['256GB', '512GB']
            }
        },
        {
            name: 'MacBook Air M3',
            description: 'Ultra-light Apple laptop with M3 chip and Liquid Retina display.',
            price: 1899,
            stock: 18,
            images: [
                'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                color: ['Midnight', 'Starlight'],
                memory: ['8GB', '16GB']
            }
        },
        {
            name: 'Sony WH-1000XM5',
            description: 'Industry-leading noise-cancelling wireless headphones.',
            price: 399,
            stock: 32,
            images: [
                'https://images.pexels.com/photos/3394659/pexels-photo-3394659.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['Black', 'Silver'],
                bundle: ['Standard', 'Travel Case']
            }
        },
    ],
    clothing: [
        {
            name: "Levi's 511 Slim Jeans",
            description: 'Stretch denim slim-fit jeans with a modern cut.',
            price: 89,
            stock: 60,
            images: [
                'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['Indigo', 'Charcoal'],
                waist: ['30', '32']
            }
        },
        {
            name: 'Patagonia Nano Puff Jacket',
            description: 'Packable insulated jacket made with recycled materials.',
            price: 229,
            stock: 35,
            images: [
                'https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['Forge Grey', 'Navy'],
                size: ['M', 'L']
            }
        },
    ],
    'home and garden': [
        {
            name: 'West Elm Harmony Sofa',
            description: 'Deep-seated 3-seater sofa with feather-filled cushions.',
            price: 1899,
            stock: 6,
            images: [
                'https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['Oatmeal', 'Steel Blue'],
                fabric: ['Performance Linen', 'Boucle']
            }
        },
        {
            name: 'Breville Barista Express',
            description: 'All-in-one espresso machine with built-in grinder.',
            price: 749,
            stock: 14,
            images: [
                'https://images.pexels.com/photos/302896/pexels-photo-302896.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['Brushed Steel', 'Black Sesame'],
                bundle: ['Machine Only', 'Machine + Milk Pitcher']
            }
        },
    ],
    sports: [
        {
            name: 'Wilson Pro Staff v14',
            description: 'Tour-level tennis racket with Paradigm Bending technology.',
            price: 279,
            stock: 22,
            images: [
                'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80',
                'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                grip: ['4 1/4', '4 3/8'],
                weight: ['290g', '315g']
            }
        },
        {
            name: 'Adidas UCL Pro Ball',
            description: 'Official match ball of the UEFA Champions League.',
            price: 165,
            stock: 45,
            images: [
                'https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                size: ['5', '4'],
                edition: ['Group Stage', 'Knockout']
            }
        },
    ],
    books: [
        {
            name: 'Atomic Habits',
            description: "James Clear's proven framework for building better habits.",
            price: 21,
            stock: 120,
            images: [
                'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                format: ['Paperback', 'Hardcover'],
                language: ['English', 'Spanish']
            }
        },
        {
            name: 'The Midnight Library',
            description: "Matt Haig's bestselling novel about second chances.",
            price: 18,
            stock: 90,
            images: [
                'https://images.unsplash.com/photo-1524578271613-d550eacf6090?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                format: ['Paperback', 'Hardcover'],
                language: ['English', 'German']
            }
        },
    ],
    'health and beauty': [
        {
            name: 'La Roche-Posay Anthelios SPF50',
            description: 'Broad-spectrum facial sunscreen for daily protection.',
            price: 34,
            stock: 80,
            images: [
                'https://images.pexels.com/photos/3992875/pexels-photo-3992875.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/932577/pexels-photo-932577.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                skinType: ['Normal', 'Oily'],
                size: ['50ml', '100ml']
            }
        },
        {
            name: 'Dyson Supersonic Hair Dryer',
            description: 'High-speed hair dryer engineered to protect from heat damage.',
            price: 429,
            stock: 26,
            images: [
                'https://images.pexels.com/photos/373967/pexels-photo-373967.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg?auto=compress&cs=tinysrgb&w=1200',
            ],
            variantOptions: {
                color: ['Iron/Fuchsia', 'Prussian Blue'],
                bundle: ['Standard', 'Detangling Comb']
            }
        },
    ],
    toys: [
        {
            name: 'LEGO Icons Bonsai Tree',
            description: 'Zen-inspired buildable bonsai set for display.',
            price: 59,
            stock: 55,
            images: [
                'https://images.pexels.com/photos/6969968/pexels-photo-6969968.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                style: ['Sakura Blossoms', 'Classic Pine'],
                edition: ['Standard', 'Gift Box']
            }
        },
        {
            name: 'Nintendo Switch OLED',
            description: 'Hybrid console with vibrant 7\" OLED screen.',
            price: 349,
            stock: 30,
            images: [
                'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                color: ['White', 'Neon Red/Blue'],
                bundle: ['Console Only', 'Console + Mario Kart']
            }
        },
    ],
    food: [
        {
            name: 'Illy Classico Coffee Beans',
            description: '100% Arabica medium roast whole beans.',
            price: 18,
            stock: 110,
            images: [
                'https://images.pexels.com/photos/585750/pexels-photo-585750.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                size: ['250g', '1kg'],
                roast: ['Classico', 'Intenso']
            }
        },
        {
            name: 'San Pellegrino Sparkling Water',
            description: 'Naturally carbonated mineral water 12-pack.',
            price: 16,
            stock: 140,
            images: [
                'https://images.pexels.com/photos/126732/pexels-photo-126732.jpeg?auto=compress&cs=tinysrgb&w=1200',
                'https://images.unsplash.com/photo-1527169402691-feff5539e52c?auto=format&fit=crop&w=1200&q=80',
            ],
            variantOptions: {
                flavor: ['Classic', 'Lemon'],
                packSize: ['12 x 330ml', '12 x 750ml']
            }
        },
    ],
}

function validateTemplates() {
    const seenImages = new Set<string>()
    Object.entries(productTemplates).forEach(([category, products]) => {
        products.forEach(prod => {
            if (!prod.images || prod.images.length < 2) {
                throw new Error(`Product "${prod.name}" in category "${category}" must have at least 2 images`)
            }
            prod.images.forEach(url => {
                if (seenImages.has(url)) {
                    throw new Error(`Duplicate image URL detected across products: ${url}`)
                }
                seenImages.add(url)
            })
            const variantKeys = Object.keys(prod.variantOptions)
            if (variantKeys.length < 2) {
                throw new Error(`Product "${prod.name}" must define at least 2 variant options`)
            }
        })
    })
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to MongoDB')

    validateTemplates()

    // Cache uploads to avoid re-uploading the same URL
    const uploadCache = new Map<string, string>()
    const ensureCloudinaryImages = async (urls: string[]) => {
        const cloudUrls: string[] = []
        for (const url of urls) {
            if (url.includes('res.cloudinary.com')) {
                cloudUrls.push(url)
                continue
            }
            if (uploadCache.has(url)) {
                cloudUrls.push(uploadCache.get(url) as string)
                continue
            }
            try {
                const uploaded = await cloudinary.uploader.upload(url, {
                    folder: 'products',
                    use_filename: true,
                    unique_filename: false,
                })
                uploadCache.set(url, uploaded.secure_url)
                cloudUrls.push(uploaded.secure_url)
            } catch (err) {
                console.warn(`Direct upload failed for ${url}, retrying via stream...`)
                try {
                    const resp = await fetch(url)
                    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status} ${resp.statusText}`)
                    const arrayBuffer = await resp.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)

                    const uploaded = await new Promise<any>((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream(
                            {
                                folder: 'products',
                                use_filename: true,
                                unique_filename: false,
                            },
                            (error, result) => {
                                if (error) return reject(error)
                                return resolve(result)
                            }
                        )
                        stream.end(buffer)
                    })

                    uploadCache.set(url, uploaded.secure_url)
                    cloudUrls.push(uploaded.secure_url)
                } catch (streamErr) {
                    console.error(`Failed to upload ${url} to Cloudinary`, streamErr)
                }
            }
        }
        // Fall back to originals if upload failed to keep placeholders populated
        return cloudUrls.length ? cloudUrls : urls
    }

    const deleteResult = await Product.deleteMany({})
    console.log(`Cleared existing products: ${deleteResult.deletedCount}`)

    const categories = await Category.find({})
    const seededCategories = new Set<string>()

    for (const cat of categories) {
        const normalized = normalizeCategoryName(cat.name)
        const templates = productTemplates[normalized]

        if (!templates || templates.length === 0) {
            console.warn(`No templates found for category "${cat.name}", skipping seeding.`)
            continue
        }

        seededCategories.add(normalized)

        for (const prod of templates) {
            const [key1, key2] = Object.keys(prod.variantOptions)
            const arr1 = prod.variantOptions[key1].map(v => ({ [key1]: v }))
            const arr2 = prod.variantOptions[key2].map(v => ({ [key2]: v }))
            const variants = cartesianProduct(arr1, arr2)

            const images = await ensureCloudinaryImages(prod.images)

            await Product.create({
                ...prod,
                images,
                variants,
                category: cat._id,
                isActive: true
            })
        }
        console.log(`Seeded ${templates.length} products for category "${cat.name}"`)
    }

    const unusedCategories = Object.keys(productTemplates).filter(
        key => !seededCategories.has(key)
    )
    if (unusedCategories.length) {
        console.warn(
            `Templates exist for categories missing in the database: ${unusedCategories.join(', ')}`
        )
    }

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
}

seed().catch(err => {
    console.error('Seeding error:', err)
    process.exit(1)
})
