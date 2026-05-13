const mongoose = require('mongoose')

const saleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên chương trình sale là bắt buộc'],
      trim: true,
    },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    type: {
      type: String,
      enum: ['flash_sale', 'seasonal', 'clearance'],
      required: [true, 'Loại sale là bắt buộc'],
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: [true, 'Loại giảm giá là bắt buộc'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Giá trị giảm giá là bắt buộc'],
      min: [0, 'Giá trị không được âm'],
    },
    maxDiscountAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: [true, 'Ngày bắt đầu là bắt buộc'] },
    endDate: { type: Date, required: [true, 'Ngày kết thúc là bắt buộc'] },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    banner: {
      public_id: { type: String, default: '' },
      url: { type: String, default: '' },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

saleSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
})

saleSchema.index({ startDate: 1, endDate: 1 })
saleSchema.index({ isActive: 1 })

module.exports = mongoose.model('Sale', saleSchema)
