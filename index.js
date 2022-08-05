const mongoose = require('mongoose');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

mongoose.connect("mongodb://127.0.0.1:27017/user_management_system")
.then(() =>{
    console.log("DataBase Connected succesfully... ");
}).catch((err) =>{ console.log(err);});

// FOR USER routes ------------
const user_route = require("./routes/userRoute");
app.use('/', user_route);

// FOR ADMIN routes -----------
const admin_route = require("./routes/adminRoute");
app.use('/admin', admin_route);


app.listen(port, (req, res) => {
    console.log(`Server is runnig at PORT : ${port}`);
})
