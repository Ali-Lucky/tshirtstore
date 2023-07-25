const express = require('express');
const { addProduct, getAllProduct, adminGetAllProducts, getOneProduct, adminUpdateProduct, adminDeleteProduct, addReview, deleteReview, getOnlyReviewOfOneProduct } = require('../controllers/productController');
const { isLoggedIn, customRole } = require('../middlewares/user');
const router = express.Router();

// user routes
router.route('/products').get(getAllProduct);
router.route('/product/:id').get(getOneProduct);
router.route('/review/:id').put(isLoggedIn, addReview);
router.route('/review/:id').delete(isLoggedIn, deleteReview);
router.route('/reviews/:id').get(getOnlyReviewOfOneProduct);

// admin routes
router.route('/admin/product/add').post(isLoggedIn, customRole('admin'), addProduct);
router.route('/admin/products').get(isLoggedIn, customRole('admin'), adminGetAllProducts);
router.route('/admin/product/:id')
.put(isLoggedIn, customRole('admin'), adminUpdateProduct)
.delete(isLoggedIn, customRole('admin'), adminDeleteProduct);


module.exports = router;