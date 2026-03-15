import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import ProductCard from '../common/ProductCard'
import LoadingSpinner from '../common/LoadingSpinner'
import EmptyState from '../common/EmptyState'

export default function ProductGrid({ products, loading, page, pages, onPageChange }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex-1">
        <EmptyState title="Không tìm thấy sản phẩm" description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm" />
      </div>
    )
  }

  const maxVisible = 5
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2))
  const endPage = Math.min(pages, startPage + maxVisible - 1)
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1)
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i)

  return (
    <div className="flex-1">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-10">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <HiChevronLeft className="w-5 h-5" />
          </button>

          {startPage > 1 && (
            <>
              <button onClick={() => onPageChange(1)} className="w-10 h-10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">1</button>
              {startPage > 2 && <span className="w-8 text-center text-gray-400">...</span>}
            </>
          )}

          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                p === page
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {p}
            </button>
          ))}

          {endPage < pages && (
            <>
              {endPage < pages - 1 && <span className="w-8 text-center text-gray-400">...</span>}
              <button onClick={() => onPageChange(pages)} className="w-10 h-10 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">{pages}</button>
            </>
          )}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <HiChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
