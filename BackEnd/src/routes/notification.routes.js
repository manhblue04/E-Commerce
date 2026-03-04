const router = require('express').Router()
const { protect } = require('../middlewares/auth')
const { getMyNotifications, markAsRead } = require('../controllers/notificationController')

router.get('/', protect, getMyNotifications)
router.put('/:id/read', protect, markAsRead)

module.exports = router
