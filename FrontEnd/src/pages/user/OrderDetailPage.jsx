import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { HiCheck, HiX } from 'react-icons/hi'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { getOrderDetail, cancelOrder } from '../../services/orderService'
import { formatPrice } from '../../utils/formatPrice'
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../../utils/constants'

const STATUS_STEPS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Đã nhận' },
]

const STATUS_BADGE = {
  pending: 'bg-orange-50 text-orange-600',
  processing: 'bg-blue-50 text-blue-600',
  shipping: 'bg-cyan-50 text-cyan-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
}

const STATUS_LABEL = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
}

function OrderTimeline({ order, logs }) {
  const isCancelled = order.orderStatus === 'cancelled'

  if (isCancelled) {
    const cancelLog = logs.find((l) => l.status === 'cancelled')
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h2 className="font-bold text-gray-900 mb-4">Tiến trình đơn hàng</h2>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <HiX className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700">Đơn hàng đã bị hủy</p>
            {cancelLog && (
              <p className="text-xs text-red-500 mt-0.5">
                {new Date(cancelLog.changedAt).toLocaleString('vi-VN')}
                {cancelLog.note && ` — ${cancelLog.note}`}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === order.orderStatus)

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6">
      <h2 className="font-bold text-gray-900 mb-6">Tiến trình đơn hàng</h2>
      <div className="flex items-start">
        {STATUS_STEPS.map((step, idx) => {
          const isDone = idx <= currentIdx
          const isCurrent = idx === currentIdx
          const log = logs.find((l) => l.status === step.key)

          return (
            <div key={step.key} className="flex-1 relative">
              {/* Connector line */}
              {idx < STATUS_STEPS.length - 1 && (
                <div className={`absolute top-5 left-[calc(50%+20px)] right-0 h-0.5 ${idx < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}

              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isDone
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}>
                  {isDone ? <HiCheck className="w-5 h-5" /> : idx + 1}
                </div>
                <p className={`text-xs font-medium mt-2 ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                {log && (
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(log.changedAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetail(id)
        setOrder(res.order)
        setLogs(res.logs || [])
      } catch { /* empty */ } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    try {
      await cancelOrder(id)
      toast.success('Đã hủy đơn hàng')
      setOrder({ ...order, orderStatus: 'cancelled' })
    } catch (err) {
      toast.error(err.message)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <div className="text-center py-20 text-gray-500">Không tìm thấy đơn hàng</div>

  const badgeClass = STATUS_BADGE[order.orderStatus] || 'bg-gray-50 text-gray-600'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/don-hang" className="text-sm text-amber-600 hover:text-amber-700 mb-2 inline-block">← Quay lại</Link>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng #{order._id.slice(-8).toUpperCase()}</h1>
        </div>
        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${badgeClass}`}>
          {STATUS_LABEL[order.orderStatus] || order.orderStatus}
        </span>
      </div>

      <div className="space-y-6">
        {/* Timeline */}
        <OrderTimeline order={order} logs={logs} />

        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Sản phẩm</h2>
          <div className="space-y-3">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-400">{item.size && `Size: ${item.size}`}{item.size && item.color && ' · '}{item.color && `Màu: ${item.color}`}</p>
                  )}
                  <p className="text-xs text-gray-500">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Địa chỉ giao hàng</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-800">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Thanh toán</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Phương thức: <span className="font-medium text-gray-800">{PAYMENT_METHOD[order.paymentMethod]}</span></p>
              <p>Trạng thái: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'}`}>{PAYMENT_STATUS[order.paymentStatus]?.label}</span></p>
              <p>Ngày đặt: {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
              {order.paidAt && <p>Thanh toán lúc: {new Date(order.paidAt).toLocaleString('vi-VN')}</p>}
              {order.deliveredAt && <p>Giao hàng lúc: {new Date(order.deliveredAt).toLocaleString('vi-VN')}</p>}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span>{formatPrice(order.itemsPrice)}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Phí vận chuyển</span><span>{order.shippingPrice === 0 ? 'Miễn phí' : formatPrice(order.shippingPrice)}</span></div>
            {order.discountPrice > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá</span><span>-{formatPrice(order.discountPrice)}</span></div>}
            {order.taxPrice > 0 && <div className="flex justify-between"><span className="text-gray-600">Thuế</span><span>{formatPrice(order.taxPrice)}</span></div>}
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-bold"><span>Tổng cộng</span><span className="text-amber-600">{formatPrice(order.totalPrice)}</span></div>
          </div>
        </div>

        {/* Cancel */}
        {['pending', 'processing'].includes(order.orderStatus) && (
          <button onClick={handleCancel} className="px-6 py-2.5 border border-red-500 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition">
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
  )
}
