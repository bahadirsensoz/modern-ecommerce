'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddOrEditAddressModal from '@/components/AddOrEditAddressModal'

export default function AddressesPage() {
    const router = useRouter()
    const [addresses, setAddresses] = useState<any[]>([])
    const [selected, setSelected] = useState<any | null>(null)
    const [showModal, setShowModal] = useState(false)

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch('http://localhost:5000/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) throw new Error('Failed to fetch addresses')
            const user = await res.json()
            setAddresses(user.addresses || [])
        } catch (error) {
            console.error('Error fetching addresses:', error)
        }
    }

    useEffect(() => {
        fetchAddresses()
    }, [])

    const saveAddresses = async (newAddresses: any[]) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                throw new Error('No authentication token found')
            }

            const validAddresses = newAddresses.map(addr => ({
                label: addr.label || '',
                street: addr.street || '',
                city: addr.city || '',
                country: addr.country || '',
                postalCode: addr.postalCode || '',
                isDefault: Boolean(addr.isDefault)
            }))

            const res = await fetch('http://localhost:5000/api/users/me/addresses', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ addresses: validAddresses }),
            })

            if (!res.ok) {
                const errorText = await res.text()
                throw new Error(`Server error: ${errorText}`)
            }

            const data = await res.json()

            await fetchAddresses()
            setShowModal(false)
            setSelected(null)
        } catch (error) {
            console.error('Error saving addresses:', error)
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
            alert(`Failed to save addresses: ${errorMessage}`)
        }
    }

    const handleDelete = async (index: number) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this address?')
        if (!confirmDelete) return

        const updated = [...addresses]
        updated.splice(index, 1)
        await saveAddresses(updated)
    }

    const handleMakeDefault = async (index: number) => {
        const confirmDefault = window.confirm('Set this address as your default?')
        if (!confirmDefault) return

        const updated = addresses.map((addr, i) => ({
            ...addr,
            isDefault: i === index
        }))
        await saveAddresses(updated)
    }

    const handleEdit = (index: number) => {
        setSelected({ ...addresses[index], index })
        setShowModal(true)
    }

    const handleSave = async (newData: any) => {
        const updated = [...addresses]

        if (selected && typeof selected.index === 'number') {
            updated[selected.index] = {
                ...updated[selected.index],
                ...newData
            }
        } else {
            if (newData.isDefault) {
                updated.forEach(addr => addr.isDefault = false)
            }
            updated.push({
                ...newData,
                isDefault: newData.isDefault || addresses.length === 0
            })
        }

        await saveAddresses(updated)
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button
                onClick={() => router.push('/dashboard')}
                className="mb-6 px-4 py-2 bg-black border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-2"
            >
                ← BACK TO DASHBOARD
            </button>

            <h1 className="text-5xl font-black mb-8 transform -rotate-2">MY ADDRESSES</h1>

            <button
                className="w-full sm:w-auto mb-6 p-4 bg-green-300 border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                onClick={() => {
                    setSelected(null)
                    setShowModal(true)
                }}
            >
                ➕ ADD NEW ADDRESS
            </button>

            <div className="space-y-6">
                {addresses.map((address, index) => (
                    <div
                        key={index}
                        className={`${address.isDefault ? 'bg-yellow-500' : 'bg-gray-400'
                            } border-4 border-black p-6 relative hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200`}
                    >
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-xl">
                                        {address.label || 'ADDRESS'}
                                    </p>
                                    {address.isDefault && (
                                        <span className="bg-blue-400 text-black px-2 py-1 text-sm border-2 border-black">
                                            DEFAULT
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-700">STREET</p>
                                        <p className="font-bold bg-white border-2 border-black p-2">
                                            {address.street}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-sm font-black text-gray-700">CITY</p>
                                            <p className="font-bold bg-white border-2 border-black p-2">
                                                {address.city}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-700">POSTAL CODE</p>
                                            <p className="font-bold bg-white border-2 border-black p-2">
                                                {address.postalCode}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-sm font-black text-gray-700">COUNTRY</p>
                                        <p className="font-bold bg-white border-2 border-black p-2">
                                            {address.country}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    className="px-4 py-2 bg-yellow-300 border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                    onClick={() => handleEdit(index)}
                                >
                                    ✏️ EDIT
                                </button>
                                <button
                                    className="px-4 py-2 bg-red-500 text-white border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                    onClick={() => handleDelete(index)}
                                >
                                    🗑️ DELETE
                                </button>
                                {!address.isDefault && (
                                    <button
                                        className="px-4 py-2 bg-blue-400 text-white border-4 border-black font-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                                        onClick={() => handleMakeDefault(index)}
                                    >
                                        ⭐ MAKE DEFAULT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {addresses.length === 0 && (
                    <div className="bg-pink-200 border-4 border-black p-6 font-black text-center">
                        NO ADDRESSES SAVED YET
                    </div>
                )}
            </div>

            {showModal && (
                <AddOrEditAddressModal
                    initialData={selected}
                    onClose={() => {
                        setShowModal(false)
                        setSelected(null)
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    )
}
