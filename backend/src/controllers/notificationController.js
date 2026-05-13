const Notification = require('../models/Notification')

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(20)

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false })

    res.json({ success: true, notifications, unreadCount })
  } catch (error) {
    next(error)
  }
}

exports.markAsRead = async (req, res, next) => {
  try {
    if (req.params.id === 'all') {
      await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    } else {
      await Notification.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        { isRead: true }
      )
    }
    res.json({ success: true, message: 'Đã đánh dấu đã đọc' })
  } catch (error) {
    next(error)
  }
}

exports.createNotification = async ({ userId, type, title, message, link }) => {
  try {
    await Notification.create({ user: userId, type, title, message, link })
  } catch { /* silent */ }
}
