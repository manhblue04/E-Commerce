import api from './api'

export const createOrder = (data) => api.post('/orders', data)
export const getMyOrders = (params) => api.get('/orders/my-orders', { params })
export const getOrderDetail = (id) => api.get(`/orders/${id}`)
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`)
export const validateCoupon = (data) => api.post('/coupons/validate', data)
export const createMoMoPayment = (orderId) => api.post('/payment/momo/create', { orderId })
export const createVNPayPayment = (orderId) => api.post('/payment/vnpay/create', { orderId })
export const createStripeCheckout = (orderId) => api.post('/payment/stripe/create', { orderId })
export const getStripeSession = (sessionId) => api.get(`/payment/stripe/session/${sessionId}`)
