const express = require('express');
const { addProduct, getAllProduct, adminGetAllProducts, getOneProduct, adminUpdateProduct, adminDeleteProduct, addReview } = require('../controllers/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router = express.Router();

// user routes
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(getOneProduct);
router.route('/review/:id').put(isLoggedIn, addReview);

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts);
router.route('/admin/product/:id')
.put(isLoggedIn, customRole('admin'), adminUpdateProduct)
.delete(isLoggedIn, customRole('admin'), adminDeleteProduct);


module.exports = router;