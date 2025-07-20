import { Category } from '@/types'

export function getCategoryName(
    categoryRef: string | { _id: string; name: string } | undefined,
    categories: Category[]
): string {
    if (typeof categoryRef === 'object' && categoryRef !== null) {
        return categoryRef.name
    } else if (typeof categoryRef === 'string') {
        return categories.find(c => c._id === categoryRef)?.name || 'Unknown'
    }
    return 'Unknown'
}
