export function isValidJWT(token: string): boolean {
    if (!token) return false

    const parts = token.split('.')
    if (parts.length !== 3) {
        return false
    }

    try {
        parts.forEach(part => {
            const paddedPart = part + '='.repeat((4 - part.length % 4) % 4)
            atob(paddedPart.replace(/-/g, '+').replace(/_/g, '/'))
        })
        return true
    } catch {
        return false
    }
}

export function logTokenInfo(token: string | null, context: string) {
    if (process.env.NODE_ENV === 'development' && !token) {
        console.warn(`${context}: No token provided`)
    }
} 