import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category } from '../models/Category';
import { Product } from '../models/Product';

dotenv.config();

// Only add products, do not delete or overwrite categories

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

// Map of category name to product/variant templates (with base attributes)
const productTemplates: Record<string, Array<any>> = {
    Electronics: [
        {
            name: 'iPhone 14',
            description: 'Latest Apple smartphone',
            price: 1299,
            stock: 20,
            images: [
                'https://images.unsplash.com/photo-1510557880182-3d4d3c1b3edc?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'White'],
                storage: ['128GB', '256GB']
            }
        },
        {
            name: 'Samsung Galaxy S23',
            description: 'Flagship Samsung phone',
            price: 1199,
            stock: 15,
            images: [
                'https://images.unsplash.com/photo-1512499617640-c2f999098c01?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Green', 'Black'],
                storage: ['128GB', '512GB']
            }
        },
        {
            name: 'MacBook Pro',
            description: 'Apple laptop for professionals',
            price: 2499,
            stock: 10,
            images: [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Silver', 'Space Gray'],
                storage: ['256GB', '512GB']
            }
        },
        {
            name: 'Sony WH-1000XM5',
            description: 'Noise-cancelling headphones',
            price: 399,
            stock: 30,
            images: [
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'Silver'],
                type: ['Standard', 'Limited Edition']
            }
        },
    ],
    Clothing: [
        {
            name: 'Nike Air Max',
            description: 'Popular running shoes',
            price: 150,
            stock: 50,
            images: [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'White'],
                size: ['42', '43']
            }
        },
        {
            name: 'Levi’s 501 Jeans',
            description: 'Classic straight fit jeans',
            price: 80,
            stock: 40,
            images: [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Blue', 'Black'],
                size: ['M', 'L']
            }
        },
        {
            name: 'Ray-Ban Sunglasses',
            description: 'Iconic sunglasses',
            price: 120,
            stock: 25,
            images: [
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'Brown'],
                style: ['Classic', 'Modern']
            }
        },
        {
            name: 'Adidas Hoodie',
            description: 'Comfortable sports hoodie',
            price: 60,
            stock: 35,
            images: [
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Gray', 'Black'],
                size: ['M', 'L']
            }
        },
    ],
    'Home and Garden': [
        {
            name: 'IKEA Sofa',
            description: 'Comfortable 3-seater sofa',
            price: 499,
            stock: 8,
            images: [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Gray', 'Blue'],
                material: ['Fabric', 'Leather']
            }
        },
        {
            name: 'Philips Air Fryer',
            description: 'Healthy cooking appliance',
            price: 199,
            stock: 18,
            images: [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'White'],
                size: ['Small', 'Large']
            }
        },
        {
            name: 'Dyson Vacuum Cleaner',
            description: 'Powerful cordless vacuum',
            price: 350,
            stock: 12,
            images: [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Purple', 'Red'],
                type: ['Cordless', 'Upright']
            }
        },
        {
            name: 'Garden Chair Set',
            description: 'Outdoor chairs for your garden',
            price: 120,
            stock: 20,
            images: [
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Green', 'White'],
                material: ['Plastic', 'Wood']
            }
        },
    ],
    Sports: [
        {
            name: 'Wilson Tennis Racket',
            description: 'Professional tennis racket',
            price: 150,
            stock: 12,
            images: [
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                grip: ['4 1/4', '4 3/8'],
                color: ['Black', 'Red']
            }
        },
        {
            name: 'Adidas Soccer Ball',
            description: 'FIFA-approved match ball',
            price: 40,
            stock: 60,
            images: [
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                size: ['5', '4'],
                color: ['White', 'Yellow']
            }
        },
        {
            name: 'Nike Running Shorts',
            description: 'Lightweight running shorts',
            price: 30,
            stock: 40,
            images: [
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'Blue'],
                size: ['M', 'L']
            }
        },
        {
            name: 'Puma Sports Bag',
            description: 'Spacious gym bag',
            price: 45,
            stock: 25,
            images: [
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Black', 'Red'],
                size: ['Small', 'Large']
            }
        },
    ],
    Books: [
        {
            name: 'Atomic Habits',
            description: 'Bestselling self-help book',
            price: 20,
            stock: 100,
            images: [
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                cover: ['Paperback', 'Hardcover'],
                language: ['English', 'Turkish']
            }
        },
        {
            name: 'Harry Potter Set',
            description: 'Complete 7-book set',
            price: 90,
            stock: 30,
            images: [
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                cover: ['Paperback', 'Boxed Set'],
                language: ['English', 'Turkish']
            }
        },
        {
            name: 'The Great Gatsby',
            description: 'Classic American novel',
            price: 15,
            stock: 60,
            images: [
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                cover: ['Paperback', 'Hardcover'],
                language: ['English', 'Turkish']
            }
        },
        {
            name: 'Sapiens',
            description: 'A Brief History of Humankind',
            price: 25,
            stock: 80,
            images: [
                'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                cover: ['Paperback', 'Hardcover'],
                language: ['English', 'Turkish']
            }
        },
    ],
    'Health andBeauty': [
        {
            name: 'Maybelline Mascara',
            description: 'Best-selling mascara',
            price: 15,
            stock: 80,
            images: [
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                type: ['Waterproof', 'Regular'],
                size: ['100ml', '200ml']
            }
        },
        {
            name: 'L’Oreal Shampoo',
            description: 'Nourishing hair shampoo',
            price: 10,
            stock: 120,
            images: [
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                type: ['Moisturizing', 'Volumizing'],
                size: ['250ml', '500ml']
            }
        },
        {
            name: 'Neutrogena Face Wash',
            description: 'Gentle daily cleanser',
            price: 12,
            stock: 90,
            images: [
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                type: ['Sensitive', 'Oil-Free'],
                size: ['150ml', '200ml']
            }
        },
        {
            name: 'Oral-B Toothbrush',
            description: 'Electric toothbrush',
            price: 35,
            stock: 60,
            images: [
                'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                type: ['Rechargeable', 'Battery'],
                color: ['Blue', 'White']
            }
        },
    ],
    Toys: [
        {
            name: 'LEGO Classic Box',
            description: 'Creative building blocks',
            price: 60,
            stock: 70,
            images: [
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Classic', 'Pastel'],
                edition: ['Standard', 'Deluxe']
            }
        },
        {
            name: 'Barbie Dreamhouse',
            description: 'Ultimate dollhouse',
            price: 200,
            stock: 10,
            images: [
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Pink', 'Purple'],
                edition: ['Standard', 'Luxury']
            }
        },
        {
            name: 'Hot Wheels Set',
            description: 'Die-cast toy cars',
            price: 25,
            stock: 100,
            images: [
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                color: ['Red', 'Blue'],
                edition: ['Classic', 'Special']
            }
        },
        {
            name: 'Monopoly Board Game',
            description: 'Classic family board game',
            price: 35,
            stock: 40,
            images: [
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                edition: ['Classic', 'Deluxe'],
                language: ['English', 'Turkish']
            }
        },
    ],
    Food: [
        {
            name: 'Nescafe Coffee',
            description: 'Instant coffee jar',
            price: 8,
            stock: 200,
            images: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                size: ['100g', '200g'],
                flavor: ['Classic', 'Gold']
            }
        },
        {
            name: 'Nutella Spread',
            description: 'Chocolate hazelnut spread',
            price: 6,
            stock: 150,
            images: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                size: ['350g', '750g'],
                flavor: ['Classic', 'Hazelnut']
            }
        },
        {
            name: 'Lay’s Classic Chips',
            description: 'Crispy potato chips',
            price: 3,
            stock: 300,
            images: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                size: ['Small', 'Large'],
                flavor: ['Classic', 'Sour Cream']
            }
        },
        {
            name: 'Coca-Cola Can',
            description: 'Refreshing soft drink',
            price: 2,
            stock: 500,
            images: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
            ],
            variantOptions: {
                size: ['330ml', '500ml'],
                flavor: ['Classic', 'Zero']
            }
        },
    ],
};

// Before seeding, ensure every product has two keys in variantOptions
for (const catName in productTemplates) {
    productTemplates[catName] = productTemplates[catName].map(prod => {
        const keys = Object.keys(prod.variantOptions)
        if (keys.length === 1) {
            // Add a dummy second attribute if only one exists
            prod.variantOptions.Type = ['Standard', 'Deluxe']
        }
        return prod
    })
}

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI as string)
    console.log('Connected to MongoDB')

    // Get all categories
    const categories = await Category.find({})
    const categoryMap: Record<string, any> = {}
    categories.forEach(cat => {
        categoryMap[cat.name] = cat._id
    })

    // For each category, add products if not present
    for (const cat of categories) {
        const templates = productTemplates[cat.name] || []
        for (const prod of templates) {
            const exists = await Product.findOne({ name: prod.name, category: cat._id })
            if (!exists) {
                // Always use cartesian product of first two variant attributes if present
                const variantKeys = Object.keys(prod.variantOptions)
                let variants: any[] = []
                if (variantKeys.length >= 2) {
                    const [key1, key2] = variantKeys
                    const arr1 = prod.variantOptions[key1].map((v: string) => ({ [key1]: v }))
                    const arr2 = prod.variantOptions[key2].map((v: string) => ({ [key2]: v }))
                    variants = cartesianProduct(arr1, arr2)
                } else if (variantKeys.length === 1) {
                    const key = variantKeys[0]
                    variants = prod.variantOptions[key].map((v: string) => ({ [key]: v }))
                }
                await Product.create({ ...prod, variants, category: cat._id, isActive: true })
            }
        }
    }
    console.log('Products seeded for all categories')

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
}

seed().catch(err => {
    console.error('Seeding error:', err)
    process.exit(1)
}) 