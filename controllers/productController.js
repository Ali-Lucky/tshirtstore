const BigPromise = require('../middlewares/bigPromise');
const cloudinary = require('cloudinary');
const Product = require('../models/product');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause');

exports.addProduct = BigPromise(async (req, res, next) => {
    let data = req.body;

    const imageArray = [];

    if (!req.files) {
        return next(new CustomError('Please upload product image'));
    };
    
    if (req.files.photos) {
        let result;
        for (let i = 0; i < req.files.photos.length; i++) {
            result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                folder: 'produts'
            })
        };

        imageArray.push({
            id: result.public_id,
            secure_url: result.secure_url
        });
    };

    data.photos = imageArray;
    console.log(req.user);
    data.user = req.user.id;

    const product = await Product.create(data);

    return res.status(201).json({
        success: true,
        product
    });
});

exports.getAllProduct = BigPromise(async(req,res,next)=>{
    const resultPerPage = 6;
    const totalProductsCount = await Product.countDocuments();

    let productsObj = new WhereClause(Product.find(), req.query).search().filter();

    let products = await productsObj.base;
    const filteredProductsCount = products.length;

    // products.limit().skip()

    productsObj.pager(resultPerPage);
    products = await productsObj.base.clone();

    return res.status(200).json({
        success: true,
        products,
        filteredProductsCount,
        totalProductsCount
    });
});

exports.adminGetAllProducts = BigPromise(async(req,res,next)=>{
    const products = await Product.find();

    return res.status(200).json({
        success: true,
        products
    });
});

exports.getOneProduct = BigPromise(async(req,res,next)=>{
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('no product found'), 404);
    };

    return res.status(200).json({
        success: true,
        product
    });
});