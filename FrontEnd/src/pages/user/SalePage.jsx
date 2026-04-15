import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineTag, HiOutlineClock, HiOutlineFire } from 'react-icons/hi'
import { getActiveSales } from '../../services/productService'
import { formatPrice } from '../../utils/formatPrice'
import LoadingSpinner from '../../components/common/LoadingSpinner'

function useCountdown(endDate) {
  const [timeLeft, setTimeLeft] = useState(() => calc(endDate))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calc(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  return timeLeft
}

function calc(endDate) {
  const diff = Math.max(0, new Date(endDate) - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff,
  }
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold text-gray-900 tabular-nums bg-gray-100 rounded-lg w-12 h-12 flex items-center justify-center">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function SaleCard({ sale }) {
  const [expanded, setExpanded] = useState(false)
  const countdown = useCountdown(sale.endDate)

  const discountLabel = sale.discountType === 'percentage'
    ? `Giảm ${sale.discountValue}%${sale.maxDiscountAmount ? ` (tối đa ${formatPrice(sale.maxDiscountAmount)})` : ''}`
    : `Giảm ${formatPrice(sale.discountValue)}`

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {sale.banner && (
        <div className="h-44 overflow-hidden">
          <img src={sale.banner} alt={sale.name} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{sale.name}</h3>
            {sale.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sale.description}</p>}
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
            <HiOutlineTag className="w-3.5 h-3.5" /> {discountLabel}
          </span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <HiOutlineClock className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-500">Kết thúc sau:</span>
          <div className="flex gap-1.5">
            <CountdownUnit value={countdown.days} label="ngày" />
            <span className="text-xl font-bold text-gray-300 self-start mt-2">:</span>
            <CountdownUnit value={countdown.hours} label="giờ" />
            <span className="text-xl font-bold text-gray-300 self-start mt-2">:</span>
            <CountdownUnit value={countdown.minutes} label="phút" />
            <span className="text-xl font-bold text-gray-300 self-start mt-2">:</span>
            <CountdownUnit value={countdown.seconds} label="giây" />
          </div>
        </div>

        {/* Products toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-amber-600 hover:text-amber-700 font-medium"
        >
          {expanded ? 'Ẩn sản phẩm' : `Xem ${sale.products?.length || 0} sản phẩm giảm giá →`}
        </button>

        {expanded && sale.products?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
            {sale.products.map((p) => (
              <Link
                key={p._id}
                to={`/san-pham/${p.slug}`}
                className="group border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={p.images?.[0]?.url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-relaxed">{p.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {p.discountPrice > 0 ? (
                      <>
                        <span className="text-sm font-bold text-red-600">{formatPrice(p.discountPrice)}</span>
                        <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                      </>
                    ) : (
                      <span className="text-sm font-bold text-gray-900">{formatPrice(p.price)}</span>
                    )}
                  </div>
                  {p.rating > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-xs text-gray-500">{p.rating.toFixed(1)} ({p.numReviews})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SalePage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActiveSales().then((res) => setSales(res.sales || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <HiOutlineFire className="w-7 h-7 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Khuyến mãi</h1>
          <p className="text-sm text-gray-500 mt-0.5">Các chương trình giảm giá đang diễn ra</p>
        </div>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-20">
          <HiOutlineTag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Hiện tại chưa có chương trình khuyến mãi nào</p>
          <Link to="/san-pham" className="text-amber-600 text-sm hover:text-amber-700 mt-2 inline-block">Khám phá sản phẩm →</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {sales.map((sale) => (
            <SaleCard key={sale._id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  )
}
