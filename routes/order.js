const express = require('express');
const { isLoggedIn, customRole } = require('../middlewares/user');
const { createOrder, getOneOrder, getLoggedInOrders, adminGetAllOrders, adminUpdateOrder } = require('../controllers/orderController');
const router = express.Router();

router.route('/order/create').post(isLoggedIn, createOrder);
router.route('/order/:id').get(isLoggedIn, getOneOrder);
router.route('/myOrder').get(isLoggedIn, getLoggedInOrders);

// admin routes
router.route('/admin/orders').get(isLoggedIn, customRole("admin"), adminGetAllOrders);
router.route('/admin/order/:id').put(isLoggedIn, customRole("admin"), adminUpdateOrder);

module.exports = router;