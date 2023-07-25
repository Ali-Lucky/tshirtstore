const BigPromise = require('../middlewares/bigPromise');
const cloudinary = require('cloudinary');
const Product = require('../models/product');
const CustomError = require('../utils/customError');
const WhereClause = require('../utils/whereClause');

// user routes
exports.addProduct = BigPromise(async (req, res, next) => {
    let data = req.body;

    const imageArray = [];

    if (!req.files) {
        return next(new CustomError('Please upload product image'));
    };

    if (req.files.photos) {
        if (req.files.photos.length > 1) {
            // console.log(req.files.photos);
            // let result;
            for (let i = 0; i < req.files.photos.length; i++) {
                // console.log(req.files.photos[i]);
                const result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                    folder: 'products'
                });

                imageArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                });
            };
            // data.photos = imageArray;
        } else {
            const result = await cloudinary.v2.uploader.upload(req.files.photos.tempFilePath, {
                folder: 'products'
            });
            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
            // data.photos = imageArray;
        }
    };

    data.photos = imageArray;
    data.user = req.user.id;

    const product = await Product.create(data);

    return res.status(201).json({
        success: true,
        product
    });
});

exports.getAllProduct = BigPromise(async (req, res, next) => {
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

exports.addReview = BigPromise(async (req, res, next) => {
    const { rating, comment } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: rating,
        comment
    };

    const product = await Product.findById(req.params.id);

    const alreadyReview = product.reviews.find(
        (rev) => JSON.stringify(rev.user) === JSON.stringify(req.user._id)
    );

    if (alreadyReview) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    } else {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }

    const totalRatings = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    console.log(totalRatings);
    product.ratings = totalRatings / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true
    });
});

exports.deleteReview = BigPromise(async (req, res, next) => {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    const reviews = product.reviews.filter((rev) =>
        rev.user.toString() !== req.user._id.toString()
    );

    const numberOfReviews = reviews.length;

    const ratings = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

    await Product.findByIdAndUpdate(productId, {
        ratings,
        numberOfReviews,
        reviews
    },
        {
            new: true,
            runValidators: true
        });

    return res.status(200).json({
        success: true
    });
});

exports.getOnlyReviewOfOneProduct = BigPromise(async (req, res, next) => {
    const productId = req.params.id;

    const product = await Product.findById(productId);

    return res.status(200).json({
        success: true,
        reviews: product.reviews
    });
});


// admin routes
exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find();

    return res.status(200).json({
        success: true,
        products
    });
});

exports.getOneProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('no product found'), 404);
    };

    return res.status(200).json({
        success: true,
        product
    });
});

exports.adminUpdateProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('No product found', 404));
    };

    let imagesArray = [];

    if (req.files) {
        for (let i = 0; i < product.photos.length; i++) {
            const remove = await cloudinary.v2.uploader.destroy(product.photos[i].id);
        };

        // console.log("remove");
        // console.log(req.files.photos);

        if (req.files.photos.length > 1) {
            for (let i = 0; i < req.files.photos.length; i++) {
                // console.log(req.files.photos[i]);
                const result = await cloudinary.v2.uploader.upload(req.files.photos[i].tempFilePath, {
                    folder: "products"
                });

                // console.log("result");

                imagesArray.push({
                    id: result.public_id,
                    secure_url: result.secure_url
                });
            };
        } else {
            const result = await cloudinary.v2.uploader.upload(req.files.photos.tempFilePath, {
                folder: "products"
            });

            // console.log("result");

            imagesArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            });
        }
        req.body.photos = imagesArray;
    };

    // console.log(imagesArray);

    const update = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true,
        update
    });
});

exports.adminDeleteProduct = BigPromise(async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new CustomError('No product find', 404));
    };

    for (let i = 0; i < product.photos.length; i++) {
        const remove = await cloudinary.v2.uploader.destroy(product.photos[i].id);
    };

    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Product deleted"
    });
});

