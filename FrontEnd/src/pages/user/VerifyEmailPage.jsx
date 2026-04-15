import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import useAuthStore from '../../store/authStore'
import useCartStore from '../../store/cartStore'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const called = useRef(false)

  // Resend state
  const [resendEmail, setResendEmail] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [resendOk, setResendOk] = useState(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    api.get(`/auth/verify-email/${token}`)
      .then((res) => {
        // Auto-login: store session like normal login
        localStorage.setItem('token', res.token)
        localStorage.setItem('user', JSON.stringify(res.user))
        useAuthStore.setState({ user: res.user, token: res.token })

        // Restore saved cart for this user if any
        const savedCart = localStorage.getItem(`cart_${res.user._id}`)
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart)
            localStorage.setItem('cart', savedCart)
            useCartStore.setState({ items: parsed })
            localStorage.removeItem(`cart_${res.user._id}`)
          } catch { /* ignore */ }
        }

        setStatus('success')
        setMessage(res.message)

        // Redirect to homepage after short delay
        setTimeout(() => navigate('/'), 2000)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.message || 'Token không hợp lệ hoặc đã hết hạn')
      })
  }, [token])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail) return
    setResending(true)
    setResendMsg('')
    try {
      const res = await api.post('/auth/resend-verify-email', { email: resendEmail })
      setResendMsg(res.message)
      setResendOk(true)
    } catch (err) {
      setResendMsg(err.message || 'Gửi lại thất bại. Vui lòng thử lại.')
      setResendOk(false)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">

        {/* Loading */}
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-4">Đang xác thực email...</p>
          </>
        )}

        {/* Success → auto redirect */}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Xác thực thành công!</h1>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-sm text-amber-600 mt-3 flex items-center justify-center gap-1.5">
              <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
              Đang chuyển hướng về trang chủ...
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 transition"
            >
              Vào ngay
            </button>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-4">Xác thực thất bại</h1>
            <p className="text-gray-500 mt-2">{message}</p>

            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 whitespace-nowrap">Chưa nhận được email?</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {!resendOk ? (
              <form onSubmit={handleResend} className="space-y-3 text-left">
                <p className="text-sm text-gray-600 text-center">Nhập email đã đăng ký để nhận lại liên kết xác thực mới:</p>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 transition"
                />
                {resendMsg && (
                  <p className="text-xs text-red-500">{resendMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-3 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : 'Gửi lại email xác thực'}
                </button>
              </form>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                <svg className="w-5 h-5 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {resendMsg}
              </div>
            )}

            <Link to="/dang-nhap" className="inline-block mt-5 text-sm text-gray-500 hover:text-gray-700 transition underline underline-offset-2">
              Về trang đăng nhập
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
