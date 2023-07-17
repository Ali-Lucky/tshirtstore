const User = require('../models/user');
const BigPromise = require('../middlewares/bigPromise');
const CustomError = require('../utils/customError');
const cookieToken = require('../utils/cookieToken');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const { use } = require('../routes/user');

exports.signup = BigPromise(async (req, res, next) => {

    if (!req.files) {
        return next(new CustomError("photo is required for signup", 400));
    };

    const { name, email, password } = req.body;

    if (!email || !name || !password) {
        return next(new CustomError('Name, email and password are required', 400));
    };

    let file = req.files.photo;

    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: 'users',
        width: 150,
        crop: 'scale'
    });

    const user = await User.create({
        name,
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url,
        }
    });

    cookieToken(user, res);
});

exports.login = BigPromise(async (req, res, next) => {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
        return next(new CustomError('Please provide email and password', 400));
    };

    // get user from db
    const user = await User.findOne({ email }).select("+password");

    // if user not found in db
    if (!user) {
        return next(new CustomError("Email or password doesn't match or exist", 400));
    };

    // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    // if password doesn't match
    if (!isPasswordCorrect) {
        return next(new CustomError("Email or password doesn't match or exist", 400));
    };

    // if all goes good then send token
    cookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        message: 'Successfully logout'
    });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
    // collect email
    const { email } = req.body;

    // find user in database
    const user = await User.findOne({ email });

    // if user not found in db
    if (!user) {
        return next(new CustomError('Email not found', 400));
    };
    
    // get token from user model methods
    const forgotToken = user.getForgotpasswordToken();

    // save user fields in database
    await user.save({ validateBeforeSave: false });

    // create a URL
    const myUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${forgotToken}`;

    // craft a message
    const message = `Copy paste this link in your URL and press enter \n\n ${myUrl}`;

    // attempt to send email
    try {
        await mailHelper({
            email: user.email,
            subject: "Tshirt store - Password reset email",
            message,
        });

        // json response if email send succesfully
        res.status(200).json({
            success: true,
            message: "Email sent successfully"
        });

    } catch (error) {
        // reset user fields if things goes wrong
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save({ validateBeforeSave: false })

        return next(new CustomError(error.message, 500));
    };
});

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token = req.params.token;

    const encryptToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({ forgotPasswordToken: encryptToken, forgotPasswordExpiry: { $gt: Date.now() } });

    if (!user) {
        return next(new CustomError('Token is invalid or expired', 400));
    };

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return next(new CustomError("Password don't match", 400));
    };

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    // send a JSON response or send token
    cookieToken(user, res);
});

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
});

exports.changePassword = BigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId).select("+password");

    const isCorrectOldPassword = await user.isValidatedPassword(oldPassword);

    if (!isCorrectOldPassword) {
        return next(new CustomError('Old password is incorrect', 400));
    };

    if (newPassword !== confirmPassword) {
        return next(new CustomError("New password don't match", 400));
    };

    user.password = newPassword;
    await user.save();

    cookieToken(user, res);
});

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    const userId = req.user.id;

    const { name, email } = req.body;

    let newData = {
        name,
        email
    };

    // if (!name || !email) {
    //     return next(new CustomError('Name and email should be provided' ));
    // };

    if (req.files) {
        const user = await User.findById(userId);
        
        const imageId = user.photo.id;

        const removeFile = await cloudinary.v2.uploader.destroy(imageId);

        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: 'users',
            width: 150,
            crop: "scale"
        });

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        };
    };

    const user = await User.findByIdAndUpdate(userId, newData, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true
    });
});

exports.adminAllUsers = BigPromise(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    });
});

exports.adminGetOneUser = BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new CustomError("No user found"), 404);
    };

    return res.status(200).json({
        success: true,
        user
    });
});

exports.adminUpdateOneUser = BigPromise(async (req,res,next)=>{
    const newData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };

    const user = await User.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true
    });

    return res.status(200).json({
        success: true
    });
});

exports.adminDeleteOneUser= BigPromise(async(req,res,next)=>{
    const user = await User.findById(req.params.id);

    if (!user){
        return next(new CustomError('No user found'), 404);
    };

    const photoId = user.photo.id;

    await cloudinary.v2.uploader.destroy(photoId);

    await User.deleteOne({ _id: user._id });

    return res.status(200).json({
        success: true
    });
});

exports.managerAllUser = BigPromise(async (req,res,next)=>{
    const users = await User.find({ role: "user" });

    return res.status(200).json({
        success: true,
        users
    });
});