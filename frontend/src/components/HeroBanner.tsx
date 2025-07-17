'use client'
import { useState } from 'react'

export default function HeroBanner() {
    const [search, setSearch] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        alert(`Search for: ${search}`) // replace with real logic later
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-16 px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to MyStore</h1>
            <p className="text-lg mb-6">Find your perfect products with ease</p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search for products..."
                    className="flex-1 px-4 py-2 rounded text-black"
                />
                <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    Search
                </button>
            </form>
        </div>
    )
}
