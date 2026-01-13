'use client'

import { useEffect, useState } from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')

    useEffect(() => {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme')
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setTheme('dark')
            document.documentElement.classList.add('dark')
        } else {
            setTheme('light')
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            setTheme('light')
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return (
        <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? <FaSun className="text-orange-400" /> : <FaMoon className="text-slate-200" />}
        </button>
    )
}
