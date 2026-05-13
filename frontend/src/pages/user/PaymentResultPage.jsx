import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { getStripeSession } from '../../services/orderService'
import { HiCheckCircle, HiXCircle } from 'react-icons/hi'

const METHOD_LABELS = {
  momo: 'MoMo',
  vnpay: 'VNPay',
  stripe: 'Stripe',
}

export default function PaymentResultPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState(null)

  const method = params.get('method')
  const sessionId = params.get('session_id')
  const cancelled = params.get('cancelled')
  const queryOrderId = params.get('order_id')
  const queryStatus = params.get('status')

  useEffect(() => {
    if (cancelled) {
      setStatus('cancelled')
      setOrderId(queryOrderId)
      return
    }

    if (method === 'momo' || method === 'vnpay') {
      setOrderId(queryOrderId)
      if (queryStatus === 'success') {
        setStatus('success')
      } else if (queryStatus === 'failed') {
        setStatus('failed')
      } else {
        setStatus('error')
      }
      return
    }

    if (sessionId) {
      let mounted = true
      const verify = async () => {
        try {
          const res = await getStripeSession(sessionId)
          if (!mounted) return
          if (res.session?.payment_status === 'paid') {
            setStatus('success')
            setOrderId(res.orderId)
          } else {
            setStatus('pending')
            setOrderId(res.orderId)
          }
        } catch {
          if (mounted) setStatus('error')
        }
      }
      verify()
      return () => { mounted = false }
    }

    navigate('/')
  }, [method, sessionId, cancelled, queryOrderId, queryStatus, navigate])

  const methodLabel = METHOD_LABELS[method] || 'Stripe'

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'success' && (
          <>
            <HiCheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-6">
              Đơn hàng của bạn đã được thanh toán qua {methodLabel}. Cảm ơn bạn đã mua sắm!
            </p>
            <div className="flex gap-3 justify-center">
              <Link to={orderId ? `/don-hang/${orderId}` : '/don-hang'}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Xem đơn hàng
              </Link>
              <Link to="/" className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Tiếp tục mua sắm
              </Link>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang xử lý thanh toán</h1>
            <p className="text-gray-500 mb-6">
              Thanh toán qua {methodLabel} đang được xử lý. Trạng thái đơn hàng sẽ được cập nhật trong ít phút.
            </p>
            <Link to={orderId ? `/don-hang/${orderId}` : '/don-hang'}
              className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
              Xem đơn hàng
            </Link>
          </>
        )}

        {status === 'failed' && (
          <>
            <HiXCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-6">
              Thanh toán qua {methodLabel} không thành công. Đơn hàng vẫn được tạo và bạn có thể thử thanh toán lại.
            </p>
            <div className="flex gap-3 justify-center">
              {orderId && (
                <Link to={`/don-hang/${orderId}`}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                  Xem đơn hàng
                </Link>
              )}
              <Link to="/" className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Trang chủ
              </Link>
            </div>
          </>
        )}

        {status === 'cancelled' && (
          <>
            <HiXCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán đã bị hủy</h1>
            <p className="text-gray-500 mb-6">
              Bạn đã hủy thanh toán. Đơn hàng vẫn được tạo và bạn có thể thanh toán lại sau.
            </p>
            <div className="flex gap-3 justify-center">
              {orderId && (
                <Link to={`/don-hang/${orderId}`}
                  className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                  Xem đơn hàng
                </Link>
              )}
              <Link to="/" className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Trang chủ
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <HiXCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h1>
            <p className="text-gray-500 mb-6">
              Không thể xác nhận thanh toán. Vui lòng kiểm tra đơn hàng của bạn.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/don-hang" className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Đơn hàng của tôi
              </Link>
              <Link to="/" className="px-6 py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
