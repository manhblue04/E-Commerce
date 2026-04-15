import { useParams, Link } from 'react-router-dom'

const policies = {
  'chinh-sach-bao-mat': {
    title: 'Chính sách bảo mật',
    content: [
      {
        heading: '1. Thu thập thông tin',
        text: 'Chúng tôi thu thập thông tin cá nhân khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi. Thông tin bao gồm: họ tên, email, số điện thoại, địa chỉ giao hàng.',
      },
      {
        heading: '2. Sử dụng thông tin',
        text: 'Thông tin cá nhân được sử dụng để: xử lý đơn hàng và giao hàng, gửi thông báo về đơn hàng và khuyến mãi (nếu bạn đồng ý), cải thiện trải nghiệm mua sắm, hỗ trợ khách hàng.',
      },
      {
        heading: '3. Bảo vệ thông tin',
        text: 'Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin cá nhân của bạn. Dữ liệu thanh toán được mã hóa qua SSL và xử lý bởi các đối tác thanh toán uy tín (Stripe, MoMo, VNPay).',
      },
      {
        heading: '4. Chia sẻ thông tin',
        text: 'Chúng tôi không bán, trao đổi hay cho thuê thông tin cá nhân cho bên thứ ba, ngoại trừ: đối tác vận chuyển (để giao hàng), cổng thanh toán (để xử lý giao dịch), khi có yêu cầu từ cơ quan pháp luật.',
      },
      {
        heading: '5. Cookie',
        text: 'Website sử dụng cookie để lưu phiên đăng nhập và cải thiện trải nghiệm. Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể không hoạt động đầy đủ.',
      },
      {
        heading: '6. Quyền của bạn',
        text: 'Bạn có quyền: xem, chỉnh sửa hoặc xóa thông tin cá nhân trong phần Tài khoản; yêu cầu xóa tài khoản bằng cách liên hệ chúng tôi qua email; từ chối nhận email quảng cáo bất cứ lúc nào.',
      },
    ],
  },
  'dieu-khoan-su-dung': {
    title: 'Điều khoản sử dụng',
    content: [
      {
        heading: '1. Chấp nhận điều khoản',
        text: 'Khi truy cập và sử dụng website Fashion Store, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.',
      },
      {
        heading: '2. Tài khoản',
        text: 'Bạn chịu trách nhiệm bảo mật thông tin tài khoản, mật khẩu. Mọi hoạt động dưới tài khoản của bạn đều được coi là do bạn thực hiện. Thông báo ngay cho chúng tôi nếu phát hiện truy cập trái phép.',
      },
      {
        heading: '3. Đặt hàng & Thanh toán',
        text: 'Giá sản phẩm có thể thay đổi mà không cần thông báo trước. Chúng tôi có quyền từ chối hoặc hủy đơn hàng nếu phát hiện gian lận. Đơn hàng chỉ được xác nhận khi bạn nhận được email xác nhận từ hệ thống.',
      },
      {
        heading: '4. Sở hữu trí tuệ',
        text: 'Tất cả nội dung trên website (hình ảnh, logo, văn bản, thiết kế) thuộc quyền sở hữu của Fashion Store. Nghiêm cấm sao chép, phân phối hay sử dụng vì mục đích thương mại mà không có sự đồng ý bằng văn bản.',
      },
      {
        heading: '5. Giới hạn trách nhiệm',
        text: 'Fashion Store không chịu trách nhiệm về: thiệt hại do lỗi kỹ thuật ngoài tầm kiểm soát; sản phẩm hỏng do vận chuyển (đã có chính sách đổi trả); nội dung quảng cáo từ bên thứ ba.',
      },
      {
        heading: '6. Thay đổi điều khoản',
        text: 'Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. Phiên bản mới nhất sẽ luôn được đăng tải trên website. Việc tiếp tục sử dụng dịch vụ đồng nghĩa bạn chấp nhận điều khoản mới.',
      },
    ],
  },
  'chinh-sach-doi-tra': {
    title: 'Chính sách đổi trả',
    content: [
      {
        heading: '1. Điều kiện đổi trả',
        text: 'Sản phẩm được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng, với điều kiện: còn nguyên tem mác, chưa qua sử dụng hoặc giặt ủi, có hóa đơn mua hàng hoặc mã đơn hàng.',
      },
      {
        heading: '2. Trường hợp được đổi trả',
        text: 'Sản phẩm bị lỗi do nhà sản xuất (rách, bung chỉ, phai màu bất thường); giao sai size, màu sắc hoặc mẫu mã so với đơn hàng; sản phẩm không giống mô tả trên website.',
      },
      {
        heading: '3. Trường hợp không được đổi trả',
        text: 'Sản phẩm giảm giá trên 50% (sale đặc biệt); phụ kiện (tất, khăn, mũ) đã tháo bao bì; sản phẩm đã sử dụng, có mùi nước hoa, vết bẩn hoặc dấu hiệu đã giặt.',
      },
      {
        heading: '4. Quy trình đổi trả',
        text: 'Liên hệ qua chat hoặc email để yêu cầu đổi trả. Gửi hình ảnh sản phẩm lỗi/sai. Nhận xác nhận và hướng dẫn gửi trả hàng. Nhận sản phẩm thay thế hoặc hoàn tiền trong 3-5 ngày làm việc.',
      },
      {
        heading: '5. Phí đổi trả',
        text: 'Miễn phí đổi trả nếu lỗi từ phía cửa hàng (giao sai, lỗi sản phẩm). Nếu đổi trả do nhu cầu cá nhân (đổi size, đổi màu), khách hàng chịu phí vận chuyển hai chiều.',
      },
      {
        heading: '6. Hoàn tiền',
        text: 'Hoàn tiền qua phương thức thanh toán ban đầu. COD: hoàn vào tài khoản ngân hàng. Ví điện tử (MoMo, VNPay): hoàn vào ví. Thẻ quốc tế: hoàn vào thẻ trong 5-10 ngày làm việc.',
      },
    ],
  },
}

export default function PolicyPage() {
  const { type } = useParams()
  const policy = policies[type]

  if (!policy) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Trang không tồn tại</p>
        <Link to="/" className="text-amber-600 text-sm mt-2 inline-block">Về trang chủ</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-amber-600 hover:text-amber-700 mb-4 inline-block">← Trang chủ</Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">{policy.title}</h1>
      <div className="space-y-6">
        {policy.content.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-base font-semibold text-gray-800 mb-2">{section.heading}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{section.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 pt-6 border-t border-gray-100 text-xs text-gray-400">
        Cập nhật lần cuối: Tháng 4, 2026. Nếu có câu hỏi, vui lòng liên hệ <a href="mailto:contact@fashion.vn" className="text-amber-600">contact@fashion.vn</a>.
      </div>
    </div>
  )
}
