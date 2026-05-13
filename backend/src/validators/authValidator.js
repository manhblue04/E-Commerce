const { body } = require('express-validator')

const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 50 })
    .withMessage('Họ tên từ 2 đến 50 ký tự')
    .custom((value) => {
      if (/^[\p{Nd}\s]+$/u.test(value)) {
        throw new Error('Họ tên không được chỉ gồm chữ số')
      }
      return true
    }),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/[a-z]/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường')
    .matches(/[A-Z]/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ số'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Xác nhận mật khẩu không khớp')
    }
    return true
  }),
]

const loginValidator = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
  body('password').notEmpty().withMessage('Mật khẩu là bắt buộc'),
]

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Email không hợp lệ').normalizeEmail(),
]

const resetPasswordValidator = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Mật khẩu tối thiểu 8 ký tự')
    .matches(/[a-z]/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường')
    .matches(/[A-Z]/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .matches(/\d/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ số'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Xác nhận mật khẩu không khớp')
    }
    return true
  }),
]

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
}
