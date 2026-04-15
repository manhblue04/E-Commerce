/**
 * Shared email HTML templates for Fashion Store.
 * All templates use inline styles for maximum email-client compatibility.
 */

const BASE_COLOR = '#b45309'        // amber-700
const BTN_COLOR  = '#d97706'        // amber-600
const BTN_HOVER  = '#b45309'        // amber-700
const BG_COLOR   = '#f9fafb'        // gray-50
const CARD_BG    = '#ffffff'
const TEXT_MAIN  = '#111827'        // gray-900
const TEXT_MUTED = '#6b7280'        // gray-500
const BORDER     = '#e5e7eb'        // gray-200

/** Wraps content in the shared header/footer shell */
function layout(title, contentHtml) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${BG_COLOR};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:${TEXT_MAIN};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG_COLOR};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${CARD_BG};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BTN_HOVER} 0%,${BTN_COLOR} 100%);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:4px;color:#fff;">FASHION STORE</p>
              <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.75);letter-spacing:2px;text-transform:uppercase;">${title}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${BG_COLOR};padding:24px 40px;text-align:center;border-top:1px solid ${BORDER};">
              <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">
                Email này được gửi tự động từ hệ thống Fashion Store.<br/>
                Vui lòng không trả lời email này.
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Fashion Store. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/** Reusable call-to-action button */
function ctaButton(href, label) {
  return `
  <table cellpadding="0" cellspacing="0" style="margin:28px auto;">
    <tr>
      <td align="center" style="background:${BTN_COLOR};border-radius:10px;">
        <a href="${href}"
           style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:.5px;border-radius:10px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

/** Divider line */
const divider = `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;" />`

/** Renders a small info box */
function infoBox(html) {
  return `
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 18px;margin:20px 0;font-size:13px;color:#92400e;">
    ${html}
  </div>`
}

/* ─────────────────────────── Templates ─────────────────────────── */

/**
 * Verification email sent on registration.
 * @param {string} name  - user display name
 * @param {string} verifyUrl - full verification URL
 */
function verifyEmailTemplate(name, verifyUrl) {
  const firstName = (name || 'bạn').split(' ').pop()
  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${TEXT_MAIN};">
      Chào mừng, ${firstName}! 🎉
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:${TEXT_MUTED};line-height:1.6;">
      Cảm ơn bạn đã đăng ký tài khoản tại <strong>Fashion Store</strong>.
      Vui lòng xác thực email để hoàn tất đăng ký và bắt đầu mua sắm.
    </p>

    ${ctaButton(verifyUrl, 'Xác thực tài khoản')}

    ${infoBox(`<strong>⏰ Lưu ý:</strong> Liên kết xác thực có hiệu lực trong <strong>24 giờ</strong>.`)}

    ${divider}

    <p style="font-size:12px;color:${TEXT_MUTED};line-height:1.6;">
      Nếu nút không hoạt động, hãy sao chép và dán địa chỉ sau vào trình duyệt:<br/>
      <a href="${verifyUrl}" style="color:${BASE_COLOR};word-break:break-all;font-size:11px;">${verifyUrl}</a>
    </p>
    <p style="font-size:12px;color:${TEXT_MUTED};margin-top:12px;">
      Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.
    </p>`
  return layout('Xác thực tài khoản', body)
}

/**
 * Password reset email.
 * @param {string} name     - user display name
 * @param {string} resetUrl - full password-reset URL
 */
function resetPasswordTemplate(name, resetUrl) {
  const firstName = (name || 'bạn').split(' ').pop()
  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${TEXT_MAIN};">
      Đặt lại mật khẩu
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:${TEXT_MUTED};line-height:1.6;">
      Xin chào <strong>${firstName}</strong>, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
      Nhấn vào nút bên dưới để tiến hành:
    </p>

    ${ctaButton(resetUrl, 'Đặt lại mật khẩu')}

    ${infoBox(`<strong>⏰ Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong <strong>30 phút</strong>.`)}

    ${divider}

    <p style="font-size:12px;color:${TEXT_MUTED};line-height:1.6;">
      Nếu nút không hoạt động, hãy sao chép và dán địa chỉ sau vào trình duyệt:<br/>
      <a href="${resetUrl}" style="color:${BASE_COLOR};word-break:break-all;font-size:11px;">${resetUrl}</a>
    </p>
    <p style="font-size:12px;color:${TEXT_MUTED};margin-top:12px;">
      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này — tài khoản của bạn vẫn an toàn.
    </p>`
  return layout('Đặt lại mật khẩu', body)
}

/**
 * Order confirmation email.
 * @param {{ orderId, itemsHtml, shippingPrice, discountPrice, totalPrice, shippingAddress, paymentMethod, orderUrl }} opts
 */
function orderConfirmTemplate({ orderId, itemsHtml, shippingPrice, discountPrice, totalPrice, shippingAddress, paymentMethod, orderUrl }) {
  const shortId = String(orderId).slice(-6).toUpperCase()
  const fmtPrice = (n) => n.toLocaleString('vi-VN') + '₫'

  const body = `
    <h2 style="margin:0 0 8px;font-size:24px;font-weight:700;color:${TEXT_MAIN};">
      Cảm ơn bạn đã đặt hàng! 🛍️
    </h2>
    <p style="margin:0 0 20px;font-size:15px;color:${TEXT_MUTED};line-height:1.6;">
      Đơn hàng <strong>#${shortId}</strong> của bạn đã được tiếp nhận và đang được xử lý.
    </p>

    <!-- Order table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-collapse:collapse;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;margin-bottom:20px;font-size:14px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 14px;text-align:left;color:${TEXT_MUTED};font-weight:600;">Sản phẩm</th>
          <th style="padding:10px 14px;text-align:center;color:${TEXT_MUTED};font-weight:600;">SL</th>
          <th style="padding:10px 14px;text-align:right;color:${TEXT_MUTED};font-weight:600;">Giá</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:10px 14px;text-align:right;color:${TEXT_MUTED};font-size:13px;">Phí vận chuyển:</td>
          <td style="padding:10px 14px;text-align:right;">${shippingPrice === 0 ? '<span style="color:#16a34a;">Miễn phí</span>' : fmtPrice(shippingPrice)}</td>
        </tr>
        ${discountPrice > 0 ? `<tr>
          <td colspan="2" style="padding:4px 14px;text-align:right;color:${TEXT_MUTED};font-size:13px;">Giảm giá:</td>
          <td style="padding:4px 14px;text-align:right;color:#16a34a;">-${fmtPrice(discountPrice)}</td>
        </tr>` : ''}
        <tr style="background:#fffbeb;">
          <td colspan="2" style="padding:12px 14px;text-align:right;font-weight:700;font-size:15px;">Tổng cộng:</td>
          <td style="padding:12px 14px;text-align:right;font-weight:700;font-size:15px;color:${BTN_HOVER};">${fmtPrice(totalPrice)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Shipping info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:10px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${TEXT_MUTED};">Giao đến</p>
          <p style="margin:0;font-size:14px;color:${TEXT_MAIN};line-height:1.6;">
            <strong>${shippingAddress.fullName}</strong><br/>
            ${shippingAddress.phone}<br/>
            ${shippingAddress.addressLine},<br/>
            ${shippingAddress.ward}, ${shippingAddress.district},<br/>
            ${shippingAddress.city}
          </p>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:10px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${TEXT_MUTED};">Thanh toán</p>
          <p style="margin:0;font-size:14px;color:${TEXT_MAIN};">${paymentMethod}</p>
        </td>
      </tr>
    </table>

    ${ctaButton(orderUrl, 'Theo dõi đơn hàng')}

    ${divider}
    <p style="font-size:12px;color:${TEXT_MUTED};">
      Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua trang web hoặc trực tiếp chat hỗ trợ.
    </p>`
  return layout(`Xác nhận đơn hàng #${shortId}`, body)
}

module.exports = { verifyEmailTemplate, resetPasswordTemplate, orderConfirmTemplate }
