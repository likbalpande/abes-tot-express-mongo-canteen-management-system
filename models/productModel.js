const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        discount: Number, // discount is optional
        company: String, // company is optional
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 1,
        },
        // availability: {
        //     type: String,
        //     enum: ["in-stock", "out-of-stock"],
        //     default: "in-stock",
        // },
        quantity: {
            type: Number,
            default: 1,
            min: 0,
        },
        thumbnail: String,
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("products", productSchema); // collection

module.exports = Product;
