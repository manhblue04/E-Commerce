import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HiOutlineEye, HiOutlineEyeOff, HiCheck, HiX } from 'react-icons/hi'
import useAuthStore from '../../store/authStore'

const PW_RULES = [
  { key: 'len', test: (v) => v.length >= 8, label: 'Tối thiểu 8 ký tự' },
  { key: 'upper', test: (v) => /[A-Z]/.test(v), label: 'Có chữ hoa (A-Z)' },
  { key: 'lower', test: (v) => /[a-z]/.test(v), label: 'Có chữ thường (a-z)' },
  { key: 'digit', test: (v) => /\d/.test(v), label: 'Có chữ số (0-9)' },
]

function PasswordStrength({ password }) {
  const passed = PW_RULES.filter((r) => r.test(password)).length
  const pct = (passed / PW_RULES.length) * 100
  const color = pct <= 25 ? 'bg-red-500' : pct <= 50 ? 'bg-orange-400' : pct <= 75 ? 'bg-yellow-400' : 'bg-green-500'
  const text = pct <= 25 ? 'Yếu' : pct <= 50 ? 'Trung bình' : pct <= 75 ? 'Khá' : 'Mạnh'

  if (!password) return null
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
        </div>
        <span className={`text-xs font-medium ${pct <= 50 ? 'text-orange-500' : 'text-green-600'}`}>{text}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {PW_RULES.map((r) => {
          const ok = r.test(password)
          return (
            <div key={r.key} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
              {ok ? <HiCheck className="w-3.5 h-3.5" /> : <HiX className="w-3.5 h-3.5" />}
              {r.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()

  const validate = useMemo(() => {
    const e = {}
    if (touched.name && form.name.trim().length < 2) e.name = 'Họ tên tối thiểu 2 ký tự'
    if (touched.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Email không hợp lệ'
    if (touched.password) {
      const pw = form.password
      if (pw.length < 8) e.password = 'Tối thiểu 8 ký tự'
      else if (!/[A-Z]/.test(pw)) e.password = 'Cần ít nhất 1 chữ hoa'
      else if (!/[a-z]/.test(pw)) e.password = 'Cần ít nhất 1 chữ thường'
      else if (!/\d/.test(pw)) e.password = 'Cần ít nhất 1 chữ số'
    }
    if (touched.confirmPassword && form.confirmPassword !== form.password) e.confirmPassword = 'Mật khẩu không khớp'
    return e
  }, [form, touched])

  const isValid = form.name.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email) && PW_RULES.every((r) => r.test(form.password)) && form.confirmPassword === form.password

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleBlur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (!isValid) return
    const success = await register(form)
    if (success) navigate('/dang-nhap')
  }

  const inputClass = (field) => {
    const hasErr = touched[field] && validate[field]
    return `w-full px-4 py-3 border rounded-xl text-sm focus:outline-none transition duration-200 ${
      hasErr ? 'border-red-400 bg-red-50/50 focus:border-red-500' : 'border-gray-200 focus:border-amber-500 hover:border-gray-300'
    }`
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-500 to-orange-400" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative z-10 flex flex-col justify-between p-10 text-white h-full">
          <div>
            <Link to="/" className="text-2xl font-black tracking-widest">FASHION STORE</Link>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-bold leading-tight">
              Tham gia<br />cộng đồng<br />thời trang
            </h2>
            <p className="text-amber-100 text-lg max-w-xs leading-relaxed">
              Đăng ký để khám phá bộ sưu tập mới nhất và nhận ưu đãi độc quyền dành riêng cho thành viên.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {['bg-pink-300', 'bg-blue-300', 'bg-green-300', 'bg-purple-300'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-white/30`} />
                ))}
              </div>
              <p className="text-sm text-amber-100">10,000+ thành viên đã tham gia</p>
            </div>
          </div>
          <p className="text-xs text-amber-200/60">&copy; 2026 Fashion Store</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50/50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="text-xl font-black tracking-widest text-gray-900">FASHION STORE</Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tạo tài khoản</h1>
            <p className="text-gray-500 mt-2">Điền thông tin bên dưới để bắt đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên</label>
              <input
                id="register-name" name="name" type="text"
                value={form.name} onChange={handleChange('name')} onBlur={handleBlur('name')}
                placeholder="Nguyễn Văn A"
                className={inputClass('name')}
              />
              {touched.name && validate.name && <p className="text-xs text-red-500 mt-1">{validate.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                id="register-email" name="email" type="email"
                value={form.email} onChange={handleChange('email')} onBlur={handleBlur('email')}
                placeholder="your@email.com"
                className={inputClass('email')}
              />
              {touched.email && validate.email && <p className="text-xs text-red-500 mt-1">{validate.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mật khẩu</label>
              <div className="relative">
                <input
                  id="register-password" name="password" type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={handleChange('password')} onBlur={handleBlur('password')}
                  placeholder="Tối thiểu 8 ký tự"
                  className={`${inputClass('password')} pr-10`}
                />
                <button type="button" onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showPass ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  id="register-confirm" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')}
                  placeholder="Nhập lại mật khẩu"
                  className={`${inputClass('confirmPassword')} pr-10`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                  {showConfirm ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
              {touched.confirmPassword && validate.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{validate.confirmPassword}</p>
              )}
              {touched.confirmPassword && !validate.confirmPassword && form.confirmPassword && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><HiCheck className="w-3.5 h-3.5" /> Mật khẩu khớp</p>
              )}
            </div>

            <button type="submit" disabled={loading || !isValid}
              className="w-full py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className="text-amber-600 font-semibold hover:text-amber-700 transition">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
