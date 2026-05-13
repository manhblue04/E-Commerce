const router = require('express').Router()
const { protect, admin } = require('../middlewares/auth')
const { getSales, getSaleById, createSale, updateSale, deleteSale, getActiveSales } = require('../controllers/saleController')

router.get('/active', getActiveSales)

router.get('/', protect, admin, getSales)
router.get('/:id', protect, admin, getSaleById)
router.post('/', protect, admin, createSale)
router.put('/:id', protect, admin, updateSale)
router.delete('/:id', protect, admin, deleteSale)

module.exports = router
