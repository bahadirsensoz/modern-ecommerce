import { Product } from '@/types'

export function matchCategory(product: Product, categoryId: string): boolean {
  if (typeof product.category === 'object' && product.category !== null) {
    return product.category._id === categoryId
  }
  return product.category === categoryId
}
