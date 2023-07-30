const BigPromise = require('../middlewares/bigPromise');
const Order = require('../models/orderModel');
const Product = require('../models/product');
const CustomError = require('../utils/customError');

exports.createOrder = BigPromise(async(req,res,next)=>{
    const { shippingInfo, orderItems, paymentInfo, taxAmount, shippingAmount, totalAmount } = req.body;

    const order = await Order.create({
        shippingInfo, 
        orderItems, 
        paymentInfo, 
        taxAmount, 
        shippingAmount, 
        totalAmount,
        user: req.user._id
    });

    return res.status(201).json({
        success: true,
        order
    });
});

exports.getOneOrder = BigPromise(async(req,res,next)=>{
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        return next(new CustomError("Please check order id"), 404);
    };

    return res.status(200).json({
        success: true,
        order
    });
});

exports.getLoggedInOrders = BigPromise(async(req,res,next)=>{
    const order = await Order.find({ user: req.user._id });

    if (order.length === 0) {
        return next(new CustomError("You didn't place any order"), 404);
    };

    return res.status(200).json({
        success: true,
        order
    });
});

exports.adminGetAllOrders = BigPromise(async(req,res,next)=>{
    const order = await Order.find();

    return res.status(200).json({
        success: true,
        order
    });
});

exports.adminUpdateOrder = BigPromise(async(req,res,next)=>{
    const order = await Order.findById(req.params.id);

    if (order.oredrStatus === 'delivered') {
        return next(new CustomError('Order already delivered'), 400);
    };

    order.oredrStatus = req.body.oredrStatus;

    order.orderItems.forEach(async (prod) => {
        await updateProductStock(prod.product, prod.quantity);
    });

    await order.save();

    return res.status(200).json({
        success: true,
        order
    });
});

async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId);

    product.stock = product.stock - quantity;

    await product.save({ validateBeforeSave: false });
};

exports.adminDeleteProduct = BigPromise(async (req,res,next)=>{
    
})