'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import CartHydration from '@/components/CartHydration'
import { metadata } from './metadata'
import { useAuthStore } from '@/store/authStore'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <html lang="en">
      <head>
        <title>{metadata.title?.toString()}</title>
        <meta name="description" content={metadata.description?.toString()} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Navbar />
        <CartHydration />
        {children}
      </body>
    </html>
  )
}
