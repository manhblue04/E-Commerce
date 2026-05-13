import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { HiOutlineAdjustments, HiViewGrid, HiViewList } from 'react-icons/hi'
import ProductFilter from '../../components/products/ProductFilter'
import ActiveFilters from '../../components/products/ActiveFilters'
import ProductGrid from '../../components/products/ProductGrid'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mới nhất' },
  { value: 'price', label: 'Giá tăng dần' },
  { value: '-price', label: 'Giá giảm dần' },
  { value: '-sold', label: 'Bán chạy nhất' },
  { value: '-rating', label: 'Đánh giá cao' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showFilter, setShowFilter] = useState(false)

  const keyword = searchParams.get('keyword') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || '-createdAt'
  const page = parseInt(searchParams.get('page')) || 1
  const minPrice = searchParams.get('price[gte]') || ''
  const maxPrice = searchParams.get('price[lte]') || ''
  const gender = searchParams.get('gender') || ''
  const size = searchParams.get('size') || ''
  const color = searchParams.get('color') || ''
  const rating = searchParams.get('rating') || ''

  const filters = { category, gender, size, color, minPrice, maxPrice, rating }

  useEffect(() => {
    getCategories().then((res) => setCategories(res.categories)).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const params = { page, sort, limit: 12 }
        if (keyword) params.keyword = keyword
        if (category) params.category = category
        if (minPrice) params['price[gte]'] = minPrice
        if (maxPrice) params['price[lte]'] = maxPrice
        if (gender) params.gender = gender
        if (size) params.size = size
        if (color) params.color = color
        if (rating) params.rating = rating

        const res = await getProducts(params)
        setProducts(res.products)
        setTotal(res.total)
        setPages(res.pages)
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [keyword, category, sort, page, minPrice, maxPrice, gender, size, color, rating])

  const updateParam = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  const clearAll = useCallback(() => {
    setSearchParams(keyword ? { keyword } : {})
  }, [keyword, setSearchParams])

  const handlePageChange = useCallback((p) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', p)
    setSearchParams(params)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [searchParams, setSearchParams])

  const activeFilterCount = [category, gender, size, color, minPrice, maxPrice, rating].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {keyword ? `Kết quả: "${keyword}"` : 'Tất cả sản phẩm'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{total} sản phẩm</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setShowFilter(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition relative"
          >
            <HiOutlineAdjustments className="w-4 h-4" />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      <ActiveFilters
        filters={filters}
        categories={categories}
        onRemove={(key) => updateParam(key, '')}
        onClearAll={clearAll}
      />

      {/* Content */}
      <div className="flex gap-8">
        <ProductFilter
          categories={categories}
          filters={filters}
          onFilterChange={updateParam}
          onClearAll={clearAll}
          open={showFilter}
          onClose={() => setShowFilter(false)}
        />

        <ProductGrid
          products={products}
          loading={loading}
          page={page}
          pages={pages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}
