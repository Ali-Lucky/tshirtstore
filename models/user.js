const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Model({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        maxlength: [40, 'Name should be under 40 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        validate: [validator.isEmail, 'Please enter email in correct format'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'Password should be at least 6 characters'],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        },
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

// encrypt password before save
userSchema.pre('save', async (next) => {
    if (!this.isModified('password')) {
        return next();
    };
    this.password = await bcrypt.hash(this.password, 10);
});

// validate password with passed on user password
userSchema.methods.isValidatedPassword = async (userSendPassword) => {
    return await bcrypt.compare(userSendPassword, this.password);
};

// create and return jwt token
userSchema.methods.getJwtToken = () => {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
    });
};

module.exports = mongoose.model('User', userSchema);