import { Link } from 'react-router-dom'
import ProductCard from '../common/ProductCard'
import SectionTitle from './SectionTitle'

export default function SaleSection({ products }) {
  if (!products || products.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <SectionTitle sub="Ưu đãi đặc biệt" title="Giảm giá hấp dẫn" desc="Nhanh tay sở hữu những sản phẩm với giá ưu đãi" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      <div className="text-center mt-8">
        <Link to="/khuyen-mai" className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 transition">
          Xem tất cả khuyến mãi →
        </Link>
      </div>
    </section>
  )
}
