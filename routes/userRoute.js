const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const user_route =express();
const userController = require("../controller/userController");
const session = require('express-session');
const config = require("../config/config");
const auth = require("../middleware/auth");

user_route.use(session({secret:config.sessionSecret}));
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}));
user_route.use(express.static('public'));

const multer = require("multer");
const user = require("../models/userModel");

const storage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, path.join(__dirname, "../public/userImages"));
    },
    filename: function(req, file, cb){
        const name = Date.now()+'--'+file.originalname; 
        cb(null, name);
    }
})
const upload = multer({storage:storage});



user_route.set("view engine", 'ejs') ;
user_route.set("views", "./views/users");






user_route.get("/register",auth.isLogout,userController.loadRegister );

user_route.post("/register", upload.single('image'),userController.insterUser );

user_route.get("/verify",auth.isLogin, userController.verifyMail);

user_route.get("/",auth.isLogout, userController.loginLoad);

user_route.get("/login",auth.isLogout, userController.loginLoad);

user_route.post("/login", userController.verifyLogin);

user_route.get("/home",auth.isLogin, userController.loadHome);

user_route.get("/logout",auth.isLogin,userController.userLogout);

user_route.get('/forget', auth.isLogout, userController.forgetLoad);

user_route.post('/forget',userController.forgetVerify);

user_route.get("/forget-password", auth.isLogout, userController.forgetPasswordLoad);

user_route.post("/forget-password", userController.resetPassword);

user_route.get("/verification",auth.isLogout, userController.verificationLoad);

user_route.post("/verification", userController.sendVerificationLink);

user_route.get("/edit", auth.isLogin, userController.editLoad);

user_route.post("/edit",upload.single('image'), userController.updateProfile);

module.exports = user_route;