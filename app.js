const express = require("express");
require("./config/dbConfig.js");
const Product = require("./models/productModel.js");

const app = express();

app.use(express.json());

app.get("/api/v1/products", async (req, res) => {
    // http://localhost:1401/api/v1/products?size=2&page=2
    try {
        const { q = "", size = 4, page = 1 } = req.query;
        const productsQuery = Product.find();
        if (q.length > 0) {
            const reg = new RegExp(q, "i");
            console.log(reg);
            productsQuery.where("title").regex(reg);
        }
        const productsQueryClone = productsQuery.clone();

        productsQuery.sort("price -title");
        productsQuery.skip((page - 1) * size);
        productsQuery.limit(size);

        const products = await productsQuery;

        const totalProducts = await productsQueryClone.countDocuments();

        res.status(200).json({
            status: "success",
            data: {
                products,
                total: totalProducts,
            },
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});

app.post("/api/v1/products", async (req, res) => {
    try {
        const newProductInfo = req.body;
        const newProduct = await Product.create(newProductInfo);
        res.status(201).json({
            status: "success",
            data: {
                product: newProduct,
            },
        });
    } catch (err) {
        console.log(err._message);
        if (err.name == "ValidationError") {
            res.status(400).json({
                status: "fail",
                message: "Data validation failed",
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

app.listen(1401, () => {
    console.log("------- Server Started ----------");
});
