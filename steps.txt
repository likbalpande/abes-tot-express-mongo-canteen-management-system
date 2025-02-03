--> npm i -g nodemon
        :: to restart the node app on any change

-------------------------------------------
--> npm init -y
        :: to make birth certificate
--> npm i express 
        :: as a backend framework
--> npm i mongodb 
        :: as a database
--> npm i mongoose 
        :: as a middleman to make it easier to talk to database (ODM)

------------------------------------
--> in app.js
    --> require express, make app, listen it to port and add success callback
    `
        const express = require('express');
        const app = express();

        app.listen(1401, ()=>{console.log('-------- SERVER STARTED --------');})
    `

-------------------------------------
--> make config folder

-------------------------------------
* :: file
# :: folder
-------------------------------------

* app.js
# config
    | * dbConfig.js
* .git-ignore
# node_modules
* package-lock.json
* package.json

----------------------------------------
--> in dbConfig.js  
    `
        const mongoose = require('mongoose');
        mongoose.connect();
    `

------------------------------------------
--> mongoDB Atlas dashboard
    connect --> drivers --> <url> copy --> done
    network access --> add ip address --> allow access from anywhere --> confirm
    database access --> edit --> write new password --> update user

----------------------------------------
--> in dbConfig.js :: add your password in place of <db_password>
    `
        const mongoose = require('mongoose');

        const connectDB = async () => {
            try{
                await mongoose.connect(`<url>`);
                console.log("-------- DB Connected ---------");
            }
            catch(err){
                console.log("Error in DB connection", err.message);
            }
        }
        connectDB();
    `
-------------------------------------------
--> in app.js :: add dbConfig file to the execution flow
    `
        const express = require('express');
        require('./config/dbConfig.js');

        const app = express();

        app.listen(1401, ()=>{console.log('-------- SERVER STARTED --------');})
    `
-------------------------------------------------
--> RUN the file & CHECK if the connection is done
-------------------------------------------------

mongoDB structure:
--> project (NO physical significance)
    --> cluster (MACHINE)
        --> Database (generally, one application has on db)
            --> collection (folder of dataFile)
                --> document (dataFile) :: BSON
                                            --> Binary + JSON 
                                            --> JSON + type encoding of datatypes

------------------------------------------------
HOMEWORK : Google: "mongodb compass" --> download --> connect DB

-------------------------------------------------
create a database in atlas (Mongodb DBMS)

-------------------------------------------------
--> in dbConfig, in your connection url mention the database name after last "/" and before "?"

--------------------------------------------------
* :: file
# :: folder
-------------------------------------

* app.js
# config
    | * dbConfig.js
* .git-ignore
# models
    | * productModel.js
# node_modules
* package-lock.json
* package.json


------------------------------------------------
link --> https://mongoosejs.com/docs/

---------------------------------------------

    company that makes machine --> company:: stylusHybrid::machine -->product:: Real Note 12 Pro (back cover :: blue) (stylusHybrid)
    schema -->  model      --> document
      x    -->  collection --> document          
---------------------------------------------
(https://mongoosejs.com/docs/guide.html#schemas)
(https://mongoosejs.com/docs/schematypes.html#number-validators)
(https://mongoosejs.com/docs/timestamps.html)
--> in productModel.js
    `
        const mongoose = require('mongoose');

        const productSchema = new mongoose.Schema({
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
            availability: {
                type: String,
                enum: ["in-stock", "out-of-stock"],
                default: "in-stock",
            }
        },{
            timestamps: true,
        });

        const Product = mongoose.model("products", productSchema);


        module.exports = Product;
    `
--------------------------------------------------

--> in app.js :: make a new request handler for post 

`
    const express = require('express');
    require('./config/dbConfig.js');
    const Product = require('./models/productModel.js');

    const app = express();

    app.use(express.json());

    app.post("/api/v1/products", async (req, res)=>{
        const newProduct = req.body;
        const doc = await Product.create(newProduct);
        res.status(201);
        res.json({
            status: "success",
            data: doc,
        });
    })

    app.listen(1401, ()=>{console.log('-------- SERVER STARTED --------');})
`
----------------------------------------------------



----------------------------------------------------
----------------------------------------------------
----------------------------------------------------
RUN the APP and call the POST api at http://localhost:1401/api/v1/products with body as JSON 
----------------------------------------------------
----------------------------------------------------
----------------------------------------------------

MVC  - Architecture
M - Model
V - View :: with APIs, we don't create view :: Frontend Developers create VIEWs
C - Controller

--------------------------------------------------
* :: file
# :: folder
------------------------------------- -------------------------------------
"Controller class names use camelCase and have Controller as a suffix. 
The Controller suffix is always singular. The name of the resource is usually plural."
------------------------------------- -------------------------------------

# api
    # v1
        # controllers
            * productsController.js
* app.js
# config
    | * dbConfig.js
* .git-ignore
# models
    | * productModel.js
# node_modules
* package-lock.json
* package.json


------------------------------------- -------------------------------------