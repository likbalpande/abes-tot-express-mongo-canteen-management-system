const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(
            `mongodb+srv://likhileshexplorin:1234test@cluster0.dpithd6.mongodb.net/ABES_TOT_CANTEEN_APP?retryWrites=true&w=majority&appName=Cluster0`
        );
        console.log("-------- DB Connected ------");
    } catch (err) {
        console.log("❌-------- DB NOT Connected ------");
    }
};

connectDB();
