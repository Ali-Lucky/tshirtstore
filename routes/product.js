const express = require('express');
const { addProduct, getAllProduct, adminGetAllProducts, getOneProduct } = require('../controllers/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router = express.Router();

// user routes
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(getOneProduct);

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts);

module.exports = router;