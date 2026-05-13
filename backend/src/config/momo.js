const crypto = require('crypto')

function getMoMoConfig() {
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost').split(',')[0].trim()
  const serverUrl = (process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`).trim()

  return {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || '',
    secretKey: process.env.MOMO_SECRET_KEY || '',
    endpoint: 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: `${serverUrl}/api/payment/momo/redirect`,
    ipnUrl: `${serverUrl}/api/payment/momo/callback`,
  }
}

const createMoMoPayment = async ({ orderId, amount, orderInfo }) => {
  const config = getMoMoConfig()
  const requestId = `${orderId}_${Date.now()}`
  const extraData = Buffer.from(JSON.stringify({ orderId })).toString('base64')

  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${config.ipnUrl}`,
    `orderId=${requestId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${config.partnerCode}`,
    `redirectUrl=${config.redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=payWithMethod`,
  ].join('&')

  const signature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex')

  const body = {
    partnerCode: config.partnerCode,
    requestId,
    amount,
    orderId: requestId,
    orderInfo,
    redirectUrl: config.redirectUrl,
    ipnUrl: config.ipnUrl,
    requestType: 'payWithMethod',
    extraData,
    lang: 'vi',
    signature,
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return response.json()
}

function verifyMoMoSignature(data) {
  const config = getMoMoConfig()
  const rawSignature = [
    `accessKey=${config.accessKey}`,
    `amount=${data.amount}`,
    `extraData=${data.extraData}`,
    `message=${data.message}`,
    `orderId=${data.orderId}`,
    `orderInfo=${data.orderInfo}`,
    `orderType=${data.orderType}`,
    `partnerCode=${data.partnerCode}`,
    `payType=${data.payType}`,
    `requestId=${data.requestId}`,
    `responseTime=${data.responseTime}`,
    `resultCode=${data.resultCode}`,
    `transId=${data.transId}`,
  ].join('&')

  const expectedSignature = crypto
    .createHmac('sha256', config.secretKey)
    .update(rawSignature)
    .digest('hex')

  return expectedSignature === data.signature
}

module.exports = { getMoMoConfig, createMoMoPayment, verifyMoMoSignature }
