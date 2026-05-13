const Sale = require('../models/Sale')
const Product = require('../models/Product')
const cloudinary = require('../config/cloudinary')

async function applyDiscountToProducts(sale) {
  if (!sale.products?.length) return
  const products = await Product.find({ _id: { $in: sale.products } })
  for (const product of products) {
    let discount = 0
    if (sale.discountType === 'percent') {
      discount = Math.round(product.price * sale.discountValue / 100)
      if (sale.maxDiscountAmount > 0) discount = Math.min(discount, sale.maxDiscountAmount)
    } else {
      discount = sale.discountValue
    }
    product.discountPrice = Math.max(product.price - discount, 0)
    await product.save()
  }
}

async function resetDiscountForProducts(productIds) {
  if (!productIds?.length) return
  await Product.updateMany({ _id: { $in: productIds } }, { discountPrice: 0 })
}

// GET /api/admin/sales
exports.getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    const [sales, total] = await Promise.all([
      Sale.find()
        .populate('products', 'name price images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Sale.countDocuments(),
    ])

    res.json({ success: true, sales, total })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/sales/:id
exports.getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('products', 'name price images slug')
    if (!sale) return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình sale' })
    res.json({ success: true, sale })
  } catch (error) {
    next(error)
  }
}

// POST /api/admin/sales
exports.createSale = async (req, res, next) => {
  try {
    const { name, description, type, discountType, discountValue, maxDiscountAmount, startDate, endDate, products, banner, isActive } = req.body

    const data = { name, description, type, discountType, discountValue, maxDiscountAmount, startDate, endDate, products: products || [], isActive }

    if (banner && banner.startsWith('data:')) {
      const uploaded = await cloudinary.uploader.upload(banner, { folder: 'sales', width: 1200, crop: 'limit' })
      data.banner = { public_id: uploaded.public_id, url: uploaded.secure_url }
    }

    const sale = await Sale.create(data)

    const now = new Date()
    if (sale.isActive && new Date(sale.startDate) <= now && new Date(sale.endDate) >= now) {
      await applyDiscountToProducts(sale)
    }

    res.status(201).json({ success: true, sale, message: 'Tạo chương trình sale thành công' })
  } catch (error) {
    next(error)
  }
}

// PUT /api/admin/sales/:id
exports.updateSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
    if (!sale) return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình sale' })

    const oldProductIds = sale.products.map((p) => p.toString())
    const { name, description, type, discountType, discountValue, maxDiscountAmount, startDate, endDate, products, banner, removeBanner, isActive } = req.body

    if (name !== undefined) sale.name = name
    if (description !== undefined) sale.description = description
    if (type !== undefined) sale.type = type
    if (discountType !== undefined) sale.discountType = discountType
    if (discountValue !== undefined) sale.discountValue = discountValue
    if (maxDiscountAmount !== undefined) sale.maxDiscountAmount = maxDiscountAmount
    if (startDate !== undefined) sale.startDate = startDate
    if (endDate !== undefined) sale.endDate = endDate
    if (products !== undefined) sale.products = products
    if (isActive !== undefined) sale.isActive = isActive

    if (removeBanner && sale.banner?.public_id) {
      await cloudinary.uploader.destroy(sale.banner.public_id)
      sale.banner = { public_id: '', url: '' }
    }

    if (banner && banner.startsWith('data:')) {
      if (sale.banner?.public_id) await cloudinary.uploader.destroy(sale.banner.public_id)
      const uploaded = await cloudinary.uploader.upload(banner, { folder: 'sales', width: 1200, crop: 'limit' })
      sale.banner = { public_id: uploaded.public_id, url: uploaded.secure_url }
    }

    await sale.save()

    const removedProducts = oldProductIds.filter((id) => !sale.products.map(String).includes(id))
    if (removedProducts.length) await resetDiscountForProducts(removedProducts)

    const now = new Date()
    if (sale.isActive && new Date(sale.startDate) <= now && new Date(sale.endDate) >= now) {
      await applyDiscountToProducts(sale)
    } else {
      await resetDiscountForProducts(sale.products)
    }

    res.json({ success: true, sale, message: 'Cập nhật chương trình sale thành công' })
  } catch (error) {
    next(error)
  }
}

// DELETE /api/admin/sales/:id
exports.deleteSale = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id)
    if (!sale) return res.status(404).json({ success: false, message: 'Không tìm thấy chương trình sale' })

    await resetDiscountForProducts(sale.products)

    if (sale.banner?.public_id) {
      await cloudinary.uploader.destroy(sale.banner.public_id)
    }

    await sale.deleteOne()
    res.json({ success: true, message: 'Đã xóa chương trình sale' })
  } catch (error) {
    next(error)
  }
}

// GET /api/sales/active (public)
exports.getActiveSales = async (req, res, next) => {
  try {
    const now = new Date()
    const sales = await Sale.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate('products', 'name price discountPrice images slug rating numReviews')
      .sort({ endDate: 1 })
      .lean()

    res.json({ success: true, sales })
  } catch (error) {
    next(error)
  }
}
