'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AddOrEditAddressModal from '@/components/AddOrEditAddressModal'
import { Address } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { logTokenInfo, isValidJWT } from '@/utils/tokenValidation'

export default function AddressesPage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selected, setSelected] = useState<(Address & { index?: number }) | null>(null)
  const [showModal, setShowModal] = useState(false)

  const fetchAddresses = useCallback(async () => {
    try {
      if (!isAuthenticated || !token) return

      logTokenInfo(token, 'AddressesFetch')
      if (!isValidJWT(token)) return

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed to fetch addresses')
      const user = await res.json()
      setAddresses(user.addresses || [])
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const saveAddresses = async (newAddresses: Address[]) => {
    try {
      if (!isAuthenticated || !token) return

      logTokenInfo(token, 'AddressesSave')
      if (!isValidJWT(token)) return

      const validAddresses = newAddresses.map(addr => ({
        label: addr.label || '',
        street: addr.street || '',
        city: addr.city || '',
        country: addr.country || '',
        postalCode: addr.postalCode || '',
        isDefault: Boolean(addr.isDefault)
      }))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/addresses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ addresses: validAddresses }),
      })

      if (!res.ok) {
        throw new Error('Failed to save addresses')
      }

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
    if (!confirm('Are you sure you want to delete this address?')) return
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

  const handleSave = async (newData: { label: string; street: string; city: string; country: string; postalCode: string; isDefault?: boolean }) => {
    const updated = [...addresses]
    if (selected && typeof selected.index === 'number') {
      updated[selected.index] = {
        ...updated[selected.index],
        ...newData,
        isDefault: newData.isDefault ?? false
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
    <div className="page-shell max-w-4xl space-y-6">
      <button onClick={() => router.push('/dashboard')} className="ghost-btn dark:text-gray-300 dark:hover:bg-slate-800">
        Back to dashboard
      </button>

      <div className="section space-y-4 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Account</p>
            <h1 className="headline dark:text-white">My addresses</h1>
          </div>
          <button
            className="primary-btn text-sm"
            onClick={() => {
              setSelected(null)
              setShowModal(true)
            }}
          >
            Add new address
          </button>
        </div>

        <div className="space-y-4">
          {addresses.map((address, index) => (
            <div
              key={index}
              className="surface border border-gray-200 rounded-lg p-4 dark:bg-slate-900 dark:border-slate-700"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {address.label || 'Address'}
                    </p>
                    {address.isDefault && (
                      <span className="pill text-xs">Default</span>
                    )}
                  </div>
                  <p>{address.street}</p>
                  <p>{address.city}, {address.postalCode}</p>
                  <p>{address.country}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    className="ghost-btn text-sm dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                    onClick={() => handleEdit(index)}
                  >
                    Edit
                  </button>
                  <button
                    className="ghost-btn text-sm text-red-600 dark:text-rose-400 dark:hover:bg-slate-800"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                  {!address.isDefault && (
                    <button
                      className="ghost-btn text-sm dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-gray-200"
                      onClick={() => handleMakeDefault(index)}
                    >
                      Make default
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="surface rounded-2xl p-6 text-center text-gray-700 dark:bg-slate-900 dark:text-gray-400 dark:border-slate-700">
              No addresses saved yet.
            </div>
          )}
        </div>
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
