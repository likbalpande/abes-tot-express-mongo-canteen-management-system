const express = require("express");
const morgan = require("morgan");
require("./config/dbConfig.js");
const Product = require("./models/productModel.js");
const User = require("./models/userModel.js");
const OTP = require("./models/otpModel.js");
const cors = require("cors"); // npm i cors
const bcrypt = require("bcrypt"); // npm i bcrypt
const { sendEmail } = require("./utils/emailHelper.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors());

app.use((req, res, next) => {
    console.log("--> Request received", req.url);
    next();
});

// var accessLogStream = fs.createWriteStream(path.join(__dirname, "http.log"), { flags: "a" });
// app.use(morgan("combined", { stream: accessLogStream }));

app.use(morgan("dev"));

app.use(express.json());

app.get("/api/v1/products", async (req, res) => {
    // http://localhost:1401/api/v1/products?size=2&page=2
    try {
        const { q = "", size = 10, page = 1, fields = " -__v -createdAt -updateAt", sort = "price -title" } = req.query;
        const productsQuery = Product.find();
        if (q.length > 0) {
            const reg = new RegExp(q, "i");
            console.log(reg);
            productsQuery.where("title").regex(reg);
        }
        const productsQueryClone = productsQuery.clone();

        productsQuery.sort(sort);
        productsQuery.skip((page - 1) * size);
        productsQuery.limit(size);
        productsQuery.select(fields); // projection

        const products = await productsQuery;

        const totalProducts = await productsQueryClone.countDocuments();

        res.status(200).json({
            status: "success",
            data: {
                products: products,
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

app.post("/api/v1/users", async (req, res) => {
    try {
        const { otp, email, password } = req.body;

        if (!otp || !email || !password) {
            res.status(400).json({
                status: "fail",
                message: "Email, otp & password is required!",
            });
            return;
        }

        //TODO: if email already exists in the user collection (handle this case)

        // otp that is sent within last X=10 minutes
        // const otpDoc = await OTP.findOne({
        //     createdAt: {
        //         $gte: Date.now() - 10 * 60 * 1000,
        //     },
        //     email: email,
        // });
        const otpDoc = await OTP.findOne()
            .where("createdAt")
            .gte(Date.now() - 10 * 60 * 1000)
            .where("email")
            .equals(email);

        if (otpDoc === null) {
            res.status(400);
            res.json({
                statusbar: "fail",
                message: "Either otp has expired or was not sent!",
            });
            return;
        }

        console.log("🟡 : otpDoc:", otpDoc);
        const hashedOtp = otpDoc.otp;

        const isOtpValid = await bcrypt.compare(otp.toString(), hashedOtp);

        if (isOtpValid) {
            const salt = await bcrypt.genSalt(14); // 2^14
            const hashedPassword = await bcrypt.hash(password, salt);
            const newUser = await User.create({
                email,
                password: hashedPassword,
            });

            res.status(201);
            res.json({
                status: "success",
                message: "User created",
            });

            await OTP.findByIdAndDelete(otpDoc._id);
        } else {
            res.status(401);
            res.json({
                status: "fail",
                message: "Incorrect OTP!",
            });
        }
    } catch (err) {
        console.log(err.name);
        console.log(err.code);
        console.log(err.message);
        if (err.code == 11000 || err.name == "ValidationError") {
            res.status(400).json({
                status: "fail",
                message: "Data validation failed: " + err.message,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

app.post("/api/v1/login", async (req, res) => {
    try {
        const { email, password: plainPassword } = req.body;
        const currentUser = await User.findOne({ email: email });
        if (currentUser) {
            const { _id, name, password: hashedPassword } = currentUser;
            const isPasswordCorrect = await bcrypt.compare(plainPassword, hashedPassword);
            if (isPasswordCorrect) {
                const token = jwt.sign(
                    {
                        email,
                        name,
                        _id,
                    },
                    "this_is_a_very_long_secret_key_abcd_123",
                    {
                        expiresIn: "1d", // https://github.com/vercel/ms?tab=readme-ov-file#examples
                    }
                );
                console.log(token);
                res.cookie("authorization", token);
                res.status(200);
                res.json({
                    status: "success",
                });
            } else {
                res.status(401);
                res.json({
                    status: "fail",
                    message: "Email or password is invalid",
                });
            }
        } else {
            res.status(400);
            res.json({
                status: "fail",
                message: "User is not registered!",
            });
            return;
        }
    } catch (err) {
        console.log(err.name);
        console.log(err.code);
        console.log(err.message);
        res.status(500).json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});

app.post("/api/v1/otps", async (req, res) => {
    try {
        const { email } = req.body;
        if (email && email.length > 0) {
            // TODO: otp is not sent on this email at least in last x=3 minutes
            const otp = Math.floor(Math.random() * 9000 + 1000);
            const isEmailSent = await sendEmail(email, otp);
            if (isEmailSent) {
                const hashedOtp = await bcrypt.hash(otp.toString(), 14);
                await OTP.create({ email, otp: hashedOtp });
                res.status(201).json({ status: "success", message: "Otp sent to email!" });
            } else {
                res.status(500).json({ status: "success", message: "Unable to send the otp to email!" });
            }
        } else {
            res.status(400).json({ status: "fail", message: "Email is required!" });
        }
    } catch (err) {
        console.log(err.name);
        console.log(err.code);
        console.log(err.message);
        if (err.code == 11000 || err.name == "ValidationError") {
            res.status(400).json({
                status: "fail",
                message: "Data validation failed: " + err.message,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

app.use(cookieParser());

app.use((req, res, next) => {
    const { authorization } = req.cookies;
    jwt.verify(authorization, "this_is_a_very_long_secret_key_abcd_123", (error, decoded) => {
        if (error) {
            res.status(401);
            res.json({
                status: "fail",
                message: "Unauthorized",
            });
            return;
        }
        req.userInfo = decoded; // its not important
        next();
    });
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
