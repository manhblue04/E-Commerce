import { HiX } from 'react-icons/hi'
import { formatPrice } from '../../utils/formatPrice'

export default function ActiveFilters({ filters, categories, onRemove, onClearAll }) {
  const chips = []

  if (filters.category) {
    const cat = categories.find((c) => c._id === filters.category)
    if (cat) chips.push({ key: 'category', label: cat.name })
  }
  if (filters.gender) {
    const labels = { men: 'Nam', women: 'Nữ', unisex: 'Unisex' }
    chips.push({ key: 'gender', label: labels[filters.gender] || filters.gender })
  }
  if (filters.size) chips.push({ key: 'size', label: `Size ${filters.size}` })
  if (filters.color) chips.push({ key: 'color', label: filters.color })
  if (filters.rating) chips.push({ key: 'rating', label: `${filters.rating}+ sao` })
  if (filters.minPrice) chips.push({ key: 'price[gte]', label: `Từ ${formatPrice(Number(filters.minPrice))}` })
  if (filters.maxPrice) chips.push({ key: 'price[lte]', label: `Đến ${formatPrice(Number(filters.maxPrice))}` })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Đang lọc:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {chip.label}
          <HiX className="w-3 h-3" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-xs text-red-500 hover:text-red-600 font-medium ml-1"
        >
          Xóa tất cả
        </button>
      )}
    </div>
  )
}
