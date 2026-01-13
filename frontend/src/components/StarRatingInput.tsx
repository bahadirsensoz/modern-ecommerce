'use client'

import { FaStar } from 'react-icons/fa'
import { useState } from 'react'

interface StarRatingInputProps {
  rating: number
  onChange: (rating: number) => void
  disabled?: boolean
}

export default function StarRatingInput({ rating, onChange, disabled = false }: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          className={`text-2xl transition-colors ${
            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${
            star <= (hoverRating || rating) ? 'text-amber-500' : 'text-gray-300'
          }`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  )
}
