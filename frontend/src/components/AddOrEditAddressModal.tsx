'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Address } from '@/types'

interface EditAddressData extends Omit<Address, '_id'> {
  index?: number
}

const addressSchema = z.object({
  label: z.string().min(2, 'Label is required'),
  street: z.string().min(3, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  isDefault: z.boolean()
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddOrEditAddressModalProps {
  initialData: EditAddressData | null
  onClose: () => void
  onSave: (data: AddressFormData) => void
}

export default function AddOrEditAddressModal({
  initialData,
  onClose,
  onSave
}: AddOrEditAddressModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: initialData?.label || '',
      street: initialData?.street || '',
      city: initialData?.city || '',
      country: initialData?.country || '',
      postalCode: initialData?.postalCode || '',
      isDefault: initialData?.isDefault || false
    }
  })

  const handleGeolocation = () => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`)
      const data = await res.json()
      setValue('street', data.address.road || '')
      setValue('city', data.address.city || data.address.town || '')
      setValue('country', data.address.country || '')
      setValue('postalCode', data.address.postcode || '')
    })
  }

  const onSubmit = (data: AddressFormData) => {
    onSave(data)
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded shadow-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Address' : 'Add Address'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input {...register('label')} placeholder="Label (e.g. Home, Work)" className="input w-full" />
            {errors.label && <p className="text-sm text-red-500">{errors.label.message}</p>}
          </div>
          <div>
            <input {...register('street')} placeholder="Street" className="input w-full" />
            {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
          </div>
          <div>
            <input {...register('city')} placeholder="City" className="input w-full" />
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
          </div>
          <div>
            <input {...register('country')} placeholder="Country" className="input w-full" />
            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
          </div>
          <div>
            <input {...register('postalCode')} placeholder="Postal Code" className="input w-full" />
            {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...register('isDefault')} />
            <label>Set as default</label>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              type="button"
              onClick={handleGeolocation}
              className="text-sm text-blue-500 hover:underline"
            >
              Autofill from current location
            </button>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn">
                {initialData ? 'Save Changes' : 'Add Address'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
