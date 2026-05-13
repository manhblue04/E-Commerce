const axios = require('axios')
const Setting = require('../models/Setting')
const Product = require('../models/Product')

const STORE_CONTEXT = `Bạn là trợ lý chat AI thân thiện của Fashion Store 🛍️

PHONG CÁCH:
- Viết tiếng Việt, vui vẻ, dùng emoji phù hợp (🔥 ✨ 👕 👗 💰 📦 💬).
- Ngắn gọn, mỗi câu trả lời tối đa 4-5 dòng. Đi thẳng vào vấn đề.
- KHÔNG dùng markdown (**, ##). Viết như nhắn tin bình thường.
- Khi liệt kê nhiều sản phẩm/ý, mỗi mục XUỐNG DÒNG và thêm emoji đầu dòng.
- QUAN TRỌNG: Luôn viết câu hoàn chỉnh, không được bỏ dở giữa chừng.

GỢI Ý SẢN PHẨM — BẮT BUỘC dùng cú pháp:
[PRODUCT:từ khóa tìm kiếm]
Mỗi sản phẩm 1 dòng riêng. Ví dụ nếu khách hỏi "có áo khoác không":
Dạ có nè bạn ơi! ✨ Shop đang có mấy mẫu hot lắm:
[PRODUCT:áo khoác]
[PRODUCT:blazer]
Bạn thích kiểu nào để mình tư vấn thêm nhé! 😊

Thông tin cửa hàng (chỉ nhắc khi khách hỏi):
📦 Ship toàn quốc 2-5 ngày, miễn phí từ 500k
🔄 Đổi/trả 7 ngày, còn nguyên tag
💳 Thanh toán: COD, MoMo, VNPay
📞 Hotline: 1900-xxxx (8h-22h)

KHI KHÔNG BIẾT hoặc câu hỏi ngoài phạm vi thời trang/cửa hàng:
Trả lời đúng mẫu này: "Câu đó mình chưa rõ lắm 😅 Bạn nhắn cho nhân viên hỗ trợ để được tư vấn chi tiết hơn nhé!"
TUYỆT ĐỐI không trả lời dở dang hay bỏ lửng câu.`

async function getAIConfig() {
  let dbConfig = null
  try {
    const settings = await Setting.findOne().lean()
    if (settings?.ai?.apiKey) dbConfig = settings.ai
  } catch { /* fallback to env */ }

  const apiKey = dbConfig?.apiKey || process.env.AI_API_KEY
  if (!apiKey) return null

  return {
    provider: dbConfig?.provider || process.env.AI_PROVIDER || 'gemini',
    apiKey,
    model: dbConfig?.model || process.env.AI_MODEL || 'gemini-2.5-flash',
    systemPrompt: STORE_CONTEXT,
  }
}

async function callOpenAI(config, messages) {
  const res = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: config.model,
      messages,
      max_tokens: 450,
      temperature: 0.6,
    },
    { headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' }, timeout: 15000 }
  )
  return res.data.choices?.[0]?.message?.content?.trim()
}

async function callGemini(config, messages) {
  const model = config.model || 'gemini-2.5-flash'
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

  const systemInstruction = messages.find((m) => m.role === 'system')?.content || ''

  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey}`,
    {
      system_instruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: 450, temperature: 0.6 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
  )
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
}

/**
 * Search products matching [PRODUCT:query] tags in AI text.
 * Returns { cleanText, products[] } where products have _id, name, slug, price, discountPrice, image url.
 */
async function resolveProductTags(rawText) {
  const tagRegex = /\[PRODUCT:([^\]]+)\]/gi
  const matches = [...rawText.matchAll(tagRegex)]
  if (matches.length === 0) return { cleanText: rawText, products: [] }

  const products = []
  let cleanText = rawText

  const seen = new Set()
  for (const match of matches) {
    const keyword = match[1].trim()
    const found = await Product.find({
      name: { $regex: keyword, $options: 'i' },
      isActive: true,
      isDeleted: false,
    })
      .select('name slug price discountPrice images')
      .sort('-sold')
      .limit(2)
      .lean()

    if (found.length > 0) {
      const names = []
      for (const p of found) {
        if (seen.has(String(p._id))) continue
        seen.add(String(p._id))
        products.push({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          discountPrice: p.discountPrice,
          image: p.images?.[0]?.url || '',
        })
        names.push(p.name)
      }
      cleanText = cleanText.replace(match[0], names.join(', '))
    } else {
      cleanText = cleanText.replace(match[0], keyword)
    }
  }

  return { cleanText, products }
}

/** Strip leftover markdown and ensure reasonable length */
function postProcess(text) {
  return text
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/gm, '')
    .replace(/^[-*]\s+/gm, '• ')
    .trim()
}

async function generateReply(conversationHistory, userMessage) {
  const config = await getAIConfig()
  if (!config) throw new Error('AI not configured')

  const messages = [
    { role: 'system', content: config.systemPrompt },
    ...conversationHistory.slice(-8),
    ...(userMessage ? [{ role: 'user', content: userMessage }] : []),
  ]

  let text
  if (config.provider === 'gemini') {
    text = await callGemini(config, messages)
  } else {
    text = await callOpenAI(config, messages)
  }

  if (!text) throw new Error('Empty AI response')

  text = postProcess(text)
  const { cleanText, products } = await resolveProductTags(text)

  return { text: cleanText, products, provider: config.provider }
}

module.exports = { generateReply }
