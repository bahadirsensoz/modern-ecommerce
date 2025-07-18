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
            <h1 className="text-2xl font-bold mb-4">Your Addresses</h1>

            <button
                className="btn mb-4"
                onClick={() => {
                    setSelected(null)
                    setShowModal(true)
                }}
            >
                Add New Address
            </button>

            <div className="space-y-4">
                {addresses.map((address, index) => (
                    <div key={index} className="border p-4 rounded shadow-sm relative">
                        <p className="font-semibold">{address.label}{address.isDefault && ' (Default)'}</p>
                        <p>{address.street}, {address.city}, {address.country}, {address.postalCode}</p>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            <button
                                className="btn-sm border px-3 py-1 rounded"
                                onClick={() => handleEdit(index)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn-sm bg-red-600 text-white px-3 py-1 rounded"
                                onClick={() => handleDelete(index)}
                            >
                                Delete
                            </button>
                            {!address.isDefault && (
                                <button
                                    className="btn-sm bg-blue-600 text-white px-3 py-1 rounded"
                                    onClick={() => handleMakeDefault(index)}
                                >
                                    Make Default
                                </button>
                            )}
                        </div>
                    </div>
                ))}
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
