const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxLength: [120, "Product name shouldn't be more than 120 letters"]
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        maxLength: [6, "Product price shouldn't be more than 6 digits"]
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    photos: [
        {
            id: {
                type: String,
                required: true
            },
            secure_url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, 'Please select category'],
        enum: {
            values: ["shortsleeves", "longsleeves", "sweatshirt", "hoodies"],
            message: "Please select category only from shortsleeves, longsleeves, sweatshirt, hoodies"
        }
    },
    brand: {
        type: String,
        required: [true, 'Please add brand of t-shirt']
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: String,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Product', productSchema);