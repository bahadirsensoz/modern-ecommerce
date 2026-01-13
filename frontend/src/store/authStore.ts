import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Product } from '@/types'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    setAuth: (token: string, user: User) => void
    logout: () => void
    checkAuth: () => Promise<void>
    initialize: () => Promise<void>
    updateFavorites: (favorites: (string | Product)[]) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            setAuth: (token, user) => {
                logTokenInfo(token, 'setAuth')

                if (token && !isValidJWT(token)) {
                    console.error('Invalid JWT token provided to setAuth')
                    return
                }

                set({ user, token, isAuthenticated: true })
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false })
            },

            checkAuth: async () => {
                const { token } = get()
                logTokenInfo(token, 'checkAuth')

                if (!token) {
                    get().logout()
                    return
                }

                if (!isValidJWT(token)) {
                    console.error('Invalid JWT token found in store, logging out')
                    get().logout()
                    return
                }

                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    })

                    if (!res.ok) {
                        throw new Error('Invalid token')
                    }

                    const user = await res.json()
                    set({ user, token, isAuthenticated: true })
                } catch (error) {
                    console.error('Auth check failed:', error)
                    get().logout()
                }
            },

            initialize: async () => {
                const { token } = get()
                if (token) {
                    await get().checkAuth()
                }
            },

            updateFavorites: (favorites) => {
                const { user } = get()
                if (user) {
                    set({ user: { ...user, favorites: favorites as (string | Product)[] } })
                }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                }
            }
        }
    )
)