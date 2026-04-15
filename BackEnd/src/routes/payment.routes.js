const router = require('express').Router()
const express = require('express')
const { protect } = require('../middlewares/auth')
const {
  createMoMoPaymentUrl,
  createVNPayPaymentUrl,
  momoCallback,
  momoRedirect,
  vnpayReturn,
  createStripeCheckout,
  stripeWebhook,
  getStripeSession,
} = require('../controllers/paymentController')

// MoMo
router.post('/momo/create', protect, createMoMoPaymentUrl)
router.post('/momo/callback', momoCallback)
router.get('/momo/redirect', momoRedirect)

// VNPay
router.post('/vnpay/create', protect, createVNPayPaymentUrl)
router.get('/vnpay/return', vnpayReturn)

// Stripe
router.post('/stripe/create', protect, createStripeCheckout)
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
router.get('/stripe/session/:sessionId', protect, getStripeSession)

module.exports = router
