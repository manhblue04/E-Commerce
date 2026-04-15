const Order = require('../models/Order')
const { createMoMoPayment, verifyMoMoSignature } = require('../config/momo')
const { createVNPayUrl, verifyVNPaySignature } = require('../config/vnpay')

const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null

function getClientUrl() {
  return (process.env.CLIENT_URL || 'http://localhost').split(',')[0].trim()
}

// ─── MoMo ────────────────────────────────────────────

exports.createMoMoPaymentUrl = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' })
    }

    const result = await createMoMoPayment({
      orderId: order._id.toString(),
      amount: order.totalPrice,
      orderInfo: `Thanh toán đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
    })

    console.log('[MoMo] Create payment response:', { resultCode: result.resultCode, message: result.message, payUrl: result.payUrl ? 'OK' : 'MISSING' })

    if (result.resultCode === 0) {
      return res.json({ success: true, payUrl: result.payUrl })
    }

    res.status(400).json({ success: false, message: result.message || 'Lỗi tạo thanh toán MoMo' })
  } catch (error) {
    next(error)
  }
}

exports.momoCallback = async (req, res) => {
  try {
    console.log('[MoMo IPN] Received:', JSON.stringify(req.body))

    const { orderId, resultCode, extraData, signature } = req.body

    if (signature && !verifyMoMoSignature(req.body)) {
      console.error('[MoMo IPN] Invalid signature')
      return res.status(400).json({ success: false, message: 'Invalid signature' })
    }

    let realOrderId
    if (extraData) {
      try {
        const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString())
        realOrderId = decoded.orderId
      } catch { /* fallback below */ }
    }
    if (!realOrderId) {
      realOrderId = orderId.split('_')[0]
    }

    const order = await Order.findById(realOrderId)

    if (order && resultCode === 0 && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid'
      order.paidAt = Date.now()
      await order.save()
      console.log(`[MoMo IPN] Order ${realOrderId} marked as paid`)
    } else if (order && resultCode !== 0) {
      console.log(`[MoMo IPN] Order ${realOrderId} payment failed, resultCode: ${resultCode}`)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('[MoMo IPN] Error:', error.message)
    res.status(500).json({ success: false })
  }
}

exports.momoRedirect = async (req, res) => {
  try {
    const { orderId, resultCode, extraData } = req.query
    const clientUrl = getClientUrl()

    let realOrderId
    if (extraData) {
      try {
        const decoded = JSON.parse(Buffer.from(extraData, 'base64').toString())
        realOrderId = decoded.orderId
      } catch { /* fallback */ }
    }
    if (!realOrderId && orderId) {
      realOrderId = orderId.split('_')[0]
    }

    const status = String(resultCode) === '0' ? 'success' : 'failed'
    const params = new URLSearchParams({ method: 'momo', status })
    if (realOrderId) params.set('order_id', realOrderId)

    res.redirect(`${clientUrl}/thanh-toan/ket-qua?${params.toString()}`)
  } catch (error) {
    console.error('[MoMo Redirect] Error:', error.message)
    res.redirect(`${getClientUrl()}/thanh-toan/ket-qua?method=momo&status=error`)
  }
}

// ─── VNPay ───────────────────────────────────────────

exports.createVNPayPaymentUrl = async (req, res, next) => {
  try {
    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' })
    }

    const payUrl = createVNPayUrl({
      orderId: order._id.toString(),
      amount: order.totalPrice,
      orderInfo: `Thanh toan don hang #${order._id.toString().slice(-6).toUpperCase()}`,
      ipAddr: req.headers['x-forwarded-for'] || req.ip || '127.0.0.1',
    })

    res.json({ success: true, payUrl })
  } catch (error) {
    next(error)
  }
}

exports.vnpayReturn = async (req, res) => {
  try {
    console.log('[VNPay Return] Query:', JSON.stringify(req.query))

    const { vnp_TxnRef, vnp_ResponseCode } = req.query
    const clientUrl = getClientUrl()

    const isValidSignature = verifyVNPaySignature(req.query)
    if (!isValidSignature) {
      console.error('[VNPay Return] Invalid signature')
      return res.redirect(`${clientUrl}/thanh-toan/ket-qua?method=vnpay&status=error&order_id=${vnp_TxnRef || ''}`)
    }

    if (vnp_ResponseCode === '00') {
      const order = await Order.findById(vnp_TxnRef)
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid'
        order.paidAt = Date.now()
        await order.save()
        console.log(`[VNPay] Order ${vnp_TxnRef} marked as paid`)
      }
      return res.redirect(`${clientUrl}/thanh-toan/ket-qua?method=vnpay&status=success&order_id=${vnp_TxnRef}`)
    }

    console.log(`[VNPay] Payment failed for order ${vnp_TxnRef}, code: ${vnp_ResponseCode}`)
    res.redirect(`${clientUrl}/thanh-toan/ket-qua?method=vnpay&status=failed&order_id=${vnp_TxnRef}`)
  } catch (error) {
    console.error('[VNPay Return] Error:', error.message)
    res.redirect(`${getClientUrl()}/thanh-toan/ket-qua?method=vnpay&status=error`)
  }
}

// ─── Stripe ──────────────────────────────────────────

exports.createStripeCheckout = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe chưa được cấu hình' })
    }

    const { orderId } = req.body
    const order = await Order.findOne({ _id: orderId, user: req.user._id })

    if (!order) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Đơn hàng đã được thanh toán' })
    }

    const clientUrl = getClientUrl()

    const lineItems = order.orderItems.map((item) => ({
      price_data: {
        currency: 'vnd',
        product_data: {
          name: item.name,
          ...(item.image && { images: [item.image] }),
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }))

    if (order.shippingPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'vnd',
          product_data: { name: 'Phí vận chuyển' },
          unit_amount: order.shippingPrice,
        },
        quantity: 1,
      })
    }

    if (order.taxPrice > 0) {
      lineItems.push({
        price_data: {
          currency: 'vnd',
          product_data: { name: 'Thuế' },
          unit_amount: order.taxPrice,
        },
        quantity: 1,
      })
    }

    const discounts = []
    if (order.discountPrice > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: order.discountPrice,
        currency: 'vnd',
        duration: 'once',
        name: 'Mã giảm giá',
      })
      discounts.push({ coupon: coupon.id })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      ...(discounts.length && { discounts }),
      metadata: { orderId: order._id.toString() },
      success_url: `${clientUrl}/thanh-toan/ket-qua?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/thanh-toan/ket-qua?cancelled=true&order_id=${order._id}`,
    })

    order.stripeSessionId = session.id
    await order.save()

    res.json({ success: true, url: session.url, sessionId: session.id })
  } catch (error) {
    next(error)
  }
}

exports.stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(400).send('Stripe not configured')

  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const orderId = session.metadata?.orderId

    if (orderId && session.payment_status === 'paid') {
      const order = await Order.findById(orderId)
      if (order && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid'
        order.paidAt = Date.now()
        await order.save()
        console.log(`[Stripe] Order ${orderId} marked as paid via webhook`)
      }
    }
  }

  res.json({ received: true })
}

exports.getStripeSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe chưa được cấu hình' })
    }

    const { sessionId } = req.params
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const order = await Order.findOne({ stripeSessionId: sessionId })

    if (session.payment_status === 'paid' && order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid'
      order.paidAt = Date.now()
      await order.save()
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        status: session.status,
      },
      orderId: order?._id,
    })
  } catch (error) {
    next(error)
  }
}
