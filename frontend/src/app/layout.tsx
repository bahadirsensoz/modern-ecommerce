import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '../components/Navbar'
import CartHydration from '@/components/CartHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyShop',
  description: 'Modern E-commerce',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <CartHydration />
        {children}
      </body>
    </html>
  )
}