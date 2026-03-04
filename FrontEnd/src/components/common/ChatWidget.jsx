import { useState, useRef, useEffect } from 'react'
import { HiChat, HiX, HiPaperAirplane } from 'react-icons/hi'

const FAQ = [
  { keywords: ['giao hàng', 'ship', 'vận chuyển', 'delivery'], answer: 'Chúng tôi giao hàng toàn quốc trong 2-5 ngày làm việc. Miễn phí vận chuyển cho đơn hàng từ 500.000₫.' },
  { keywords: ['đổi trả', 'trả hàng', 'hoàn', 'return'], answer: 'Bạn có thể đổi/trả hàng trong vòng 7 ngày kể từ khi nhận hàng. Sản phẩm phải còn nguyên tag và chưa qua sử dụng.' },
  { keywords: ['thanh toán', 'payment', 'trả tiền', 'momo', 'vnpay', 'cod'], answer: 'Chúng tôi hỗ trợ thanh toán COD (khi nhận hàng), MoMo và VNPay.' },
  { keywords: ['size', 'kích thước', 'bảng size'], answer: 'Bạn có thể xem bảng size chi tiết tại trang sản phẩm. Nếu cần tư vấn, hãy nhắn cho chúng tôi kèm chiều cao và cân nặng.' },
  { keywords: ['mã giảm giá', 'coupon', 'voucher', 'khuyến mãi'], answer: 'Bạn có thể nhập mã giảm giá tại trang thanh toán. Theo dõi fanpage để nhận mã mới nhất!' },
  { keywords: ['tài khoản', 'đăng ký', 'đăng nhập', 'mật khẩu', 'quên'], answer: 'Bạn có thể đăng ký/đăng nhập tại mục "Tài khoản". Nếu quên mật khẩu, hãy sử dụng tính năng "Quên mật khẩu" để đặt lại.' },
  { keywords: ['liên hệ', 'hotline', 'email', 'hỗ trợ'], answer: 'Hotline: 1900-xxxx (8h-22h). Email: support@fashionstore.vn. Hoặc nhắn tin trực tiếp qua chat này!' },
  { keywords: ['đơn hàng', 'theo dõi', 'tracking', 'trạng thái'], answer: 'Bạn có thể theo dõi đơn hàng tại mục "Đơn hàng" sau khi đăng nhập.' },
]

const findAnswer = (msg) => {
  const lower = msg.toLowerCase()
  for (const faq of FAQ) {
    if (faq.keywords.some((kw) => lower.includes(kw))) return faq.answer
  }
  return null
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý Fashion Store. Bạn cần hỗ trợ gì?' },
  ])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed) return

    const newMsgs = [...messages, { from: 'user', text: trimmed }]
    setMessages(newMsgs)
    setInput('')

    setTimeout(() => {
      const answer = findAnswer(trimmed)
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: answer || 'Cảm ơn bạn đã liên hệ! Câu hỏi này sẽ được chuyển đến nhân viên hỗ trợ. Bạn cũng có thể hỏi về: giao hàng, đổi trả, thanh toán, size, mã giảm giá, đơn hàng.' },
      ])
    }, 500)
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition flex items-center justify-center"
        >
          <HiChat className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: 480 }}>
          <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div>
              <p className="font-semibold text-sm">Fashion Store</p>
              <p className="text-xs text-gray-300">Hỗ trợ trực tuyến</p>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-lg p-1 transition">
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-amber-500 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-gray-100 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-amber-500 transition"
              />
              <button type="submit" className="w-10 h-10 bg-amber-500 text-white rounded-lg flex items-center justify-center hover:bg-amber-600 transition shrink-0">
                <HiPaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
