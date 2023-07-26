const BigPromise = require('../middlewares/bigPromise');
const stripe = require('stripe')(process.env.STRIPE_SECRET);

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    return res.status(200).json({
        stripeKey: process.env.STRIPE_API_KEY
    });
});

exports.captureStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr'
    });

    metadata = { integration_check: 'accept_a_payment' };

    return res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
    });
});

exports.sendRazorpayKey = BigPromise(async (req, res, next) => {
    return res.status(200).json({
        razorpayKey: process.env.RAZORPAY_API_KEY
    });
});

exports.captureRazorpayPayment = BigPromise(async (req, res, next) => {
    const instance = new Razorpay({
        key_id: 'YOUR_KEY_ID',
        key_secret: 'YOUR_SECRET'
    })

    const options = {
        amount: req.body.amount * 100,
        currency: "INR",
    };
    
    const myOrder = await instance.orders.create(options);

    return res.status(200).json({
        success: true,
        amount: req.body.amount,
        order: myOrder
    });
});