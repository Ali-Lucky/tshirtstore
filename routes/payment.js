const express = require('express');
const router = express.Router();

const { isLoggedIn } = require('../middlewares/user');
const { sendStripeKey, sendRazorpayKey, captureStripePayment, captureRazorpayPayment } = require('../controllers/paymentController');

router.route('/stripeKey').get(isLoggedIn, sendStripeKey);
router.route('/razorpayKey').get(isLoggedIn, sendRazorpayKey);
router.route('/captureStripe').post(isLoggedIn, captureStripePayment);
router.route('/captureRazorpay').post(isLoggedIn, captureRazorpayPayment);

module.exports = router;