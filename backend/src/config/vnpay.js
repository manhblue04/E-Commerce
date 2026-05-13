const crypto = require('crypto')
const querystring = require('querystring')

function getVNPayConfig() {
  const serverUrl = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).trim()

  return {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    secretKey: process.env.VNPAY_SECRET_KEY || '',
    url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: `${serverUrl}/api/payment/vnpay/return`,
  }
}

const createVNPayUrl = ({ orderId, amount, orderInfo, ipAddr }) => {
  const config = getVNPayConfig()
  const date = new Date()
  const createDate = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)

  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  }

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => { obj[key] = params[key]; return obj }, {})

  const signData = querystring.stringify(sortedParams, '&', '=')
  const hmac = crypto.createHmac('sha512', config.secretKey)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return `${config.url}?${querystring.stringify(sortedParams)}&vnp_SecureHash=${signed}`
}

function verifyVNPaySignature(query) {
  const config = getVNPayConfig()
  const secureHash = query.vnp_SecureHash

  const params = { ...query }
  delete params.vnp_SecureHash
  delete params.vnp_SecureHashType

  const sortedParams = Object.keys(params)
    .sort()
    .reduce((obj, key) => { obj[key] = params[key]; return obj }, {})

  const signData = querystring.stringify(sortedParams, '&', '=')
  const hmac = crypto.createHmac('sha512', config.secretKey)
  const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return expectedHash === secureHash
}

module.exports = { getVNPayConfig, createVNPayUrl, verifyVNPaySignature }
