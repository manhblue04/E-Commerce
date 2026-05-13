import { useState, useCallback } from 'react'
import { HiX, HiStar, HiChevronDown, HiChevronUp } from 'react-icons/hi'
import useDebounce from '../../hooks/useDebounce'
import { useEffect } from 'react'

const GENDERS = [
  { value: '', label: 'Tất cả' },
  { value: 'men', label: 'Nam' },
  { value: 'women', label: 'Nữ' },
  { value: 'unisex', label: 'Unisex' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = ['Đen', 'Trắng', 'Beige', 'Xám', 'Nâu', 'Xanh navy']
const RATINGS = [4, 3, 2, 1]

const PRICE_PRESETS = [
  { label: 'Dưới 200K', min: '', max: '200000' },
  { label: '200K – 500K', min: '200000', max: '500000' },
  { label: '500K – 1 triệu', min: '500000', max: '1000000' },
  { label: 'Trên 1 triệu', min: '1000000', max: '' },
]

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 pb-5 mb-5 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3"
      >
        {title}
        {open ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  )
}

export default function ProductFilter({ categories, filters, onFilterChange, onClearAll, open, onClose }) {
  const { category, gender, size, color, minPrice, maxPrice, rating } = filters

  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)
  const debouncedMin = useDebounce(localMin, 600)
  const debouncedMax = useDebounce(localMax, 600)

  useEffect(() => { setLocalMin(minPrice) }, [minPrice])
  useEffect(() => { setLocalMax(maxPrice) }, [maxPrice])

  useEffect(() => {
    if (debouncedMin !== minPrice) onFilterChange('price[gte]', debouncedMin)
  }, [debouncedMin])

  useEffect(() => {
    if (debouncedMax !== maxPrice) onFilterChange('price[lte]', debouncedMax)
  }, [debouncedMax])

  const applyPreset = useCallback((preset) => {
    setLocalMin(preset.min)
    setLocalMax(preset.max)
    onFilterChange('price[gte]', preset.min)
    onFilterChange('price[lte]', preset.max)
  }, [onFilterChange])

  const isPresetActive = (p) => localMin === p.min && localMax === p.max && (p.min || p.max)

  const hasFilters = category || minPrice || maxPrice || gender || size || color || rating

  return (
    <aside className={`
      ${open ? 'fixed inset-0 z-50 bg-white dark:bg-gray-950 overflow-y-auto' : 'hidden'}
      lg:block lg:static lg:w-60 shrink-0
    `}>
      <div className={`${open ? 'p-5' : ''} lg:p-0`}>
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bộ lọc</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <FilterSection title="Danh mục">
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange('category', '')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                !category
                  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => onFilterChange('category', cat._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  category === cat._id
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Khoảng giá">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRICE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    isPresetActive(p)
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Từ"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent focus:outline-none focus:border-amber-500 dark:text-gray-200"
              />
              <span className="text-gray-400 text-sm">–</span>
              <input
                type="number"
                placeholder="Đến"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-transparent focus:outline-none focus:border-amber-500 dark:text-gray-200"
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title="Giới tính">
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => onFilterChange('gender', g.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  gender === g.value
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Kích thước">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => onFilterChange('size', size === s ? '' : s)}
                className={`w-10 h-10 rounded-lg text-xs font-medium border transition flex items-center justify-center ${
                  size === s
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Màu sắc">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onFilterChange('color', color === c ? '' : c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  color === c
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Đánh giá">
          <div className="space-y-1.5">
            {RATINGS.map((r) => (
              <button
                key={r}
                onClick={() => onFilterChange('rating', rating === String(r) ? '' : String(r))}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition ${
                  rating === String(r)
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <HiStar key={s} className={`w-4 h-4 ${s <= r ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
                <span>{r}+ sao</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {hasFilters && (
          <button
            onClick={onClearAll}
            className="w-full mt-2 py-2.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition"
          >
            Xóa tất cả bộ lọc
          </button>
        )}

        {open && (
          <button
            onClick={onClose}
            className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg lg:hidden"
          >
            Xem kết quả
          </button>
        )}
      </div>
    </aside>
  )
}
