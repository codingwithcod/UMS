const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { findOne } = require("../models/userModel");
const randomstring = require("randomstring");
const config = require("../config/config");
const nodemailer =require('nodemailer');
const user = require("../models/userModel");


// reset password mail

const sendResetPasswordMail = async(name , email, token) =>{

    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure:false,
            requireTLS:true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOption = {
            from: config.emailUser,
            to: email,
            subject:'for Forget Password mail',
            html:'<p>jai Ram ji ki ' +name+',<br> please click here to <a href="http://localhost:4000/admin/forget-password?token='+token+'">Reset</a> Your Password. </p>'
        }

        transporter.sendMail(mailOption, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent "+ info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};

// send add usermalil


const addUserMail = async(name , email, password, user_id) =>{

    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure:false,
            requireTLS:true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOption = {
            from: config.emailUser,
            to: email,
            subject:'Admin add you and verify your  mail',
            html:'<p>jai Ram ji ki ' +name+',<br> please click here to <a href="http://localhost:4000/verify?id='+user_id+'">Verify</a> Your mail. </p> <br><br> <b>Email:-</b>'+email+'<br> <b>Password:-</b>'+password+''
        }

        transporter.sendMail(mailOption, function(error, info){
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent "+ info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};


// password hashing 

const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;
        
    } catch (error) {
        console.log(error.message);
    }
};


// loding mathods 

const loadLogin  = async (req, res) => {
    try {
        res.render("login");
    } catch (error) {
        console.log(error);
    }
};

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {

                if (userData.is_admin == 0) {
                    res.render("login", {message:"you are not Admin.🤨"});
    
                } else {
                    req.session.user_id = userData._id
                    res.redirect("/admin/home");
                    
                }

            }else {
                res.render("login", {message:'Invalid login Detials..'})
                
            }
        }else {
            res.render("login", {message:'Invalid login Detials..'})
            
        }
       

        
    } catch (error) {
        console.log(error);
    }
};

const loadDashboard = async(req, res) => {
    try {
        const userData = await User.findById({_id:req.session.user_id})
        res.render('home',{admin:userData});
    } catch (error) {
        console.log(error);
    }
};

const logoutLoad = async(req, res) =>{

    try {
        
        req.session.destroy();
        res.redirect('/admin');

    } catch (error) {
        console.log(error);
    }
};

const forgetLoad = async(req, res) => {

    try {

        res.render('forget');
        
    } catch (error) {
        console.log(error);
    }
};


const forgetVerify =async(req, res) => {

    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email});

        if(userData){
            if (userData.is_admin === 0) {
                res.render("forget", {message:" Invalid Email"})
                
            }else{
                const randomString = randomstring.generate();

                const updatedData = await User.updateOne({email:email}, { $set: {token:randomString}});

                sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', {message: 'Please check your mail to Reset Your Password'})

            }


        }else{
            res.render("forget", {message:" Invalid Email"})
        }

        
    } catch (error) {
        console.log(error);
    }
};

const forgetPasswordLoad = async(req, res) => {

    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        
        if(tokenData){
            res.render('forget-password', {user_id:tokenData._id})
        }else{
            res.render('404', {message:'Invalid Token '});

        };

        
    } catch (error) {
        console.log(error);
    }
};


const resetPassword = async(req, res) => {
    try {
        const user_id = req.body.user_id;
        const password = req.body.password;

        const sPassword = await securePassword(password);

        const updatedData = await User.findByIdAndUpdate({_id:user_id}, { $set: {password:sPassword, token:''}});

        res.redirect("/admin");



        
    } catch (error) {
        console.log(error);
    }
};

const adminDashboard = async(req, res) => {
    try {
        const usersData = await User.find({is_admin:0});
        res.render('dashboard', {users:usersData});
    } catch (error) {
        console.log(error);
    }
};

// adding new user ================ 

const newUserLoad = async(req, res) => {
    try {
        res.render("new-user");
    } catch (error) {
        console.log(error);
    }
};


const addUser = async(req, res) =>  {
    try {

        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const image = req.file.filename;
        const password = randomstring.generate(10);
        const sPassword = await securePassword(password);

        const user = new User({
            name: name,
            email:email,
            mobile:mobile,
            image:image,
            password:sPassword,
            is_admin:0
        });

       const userData = await user.save();

       if (userData) {
                addUserMail(name, email, password, userData._id);
                res.redirect("/admin/dashboard")
       } else {
        res.render('new-user', {message:'Something Wrong'})
       }
        
    } catch (error) {
        console.log(error);
    }
};

// for edit of user

const editUserLoad = async(req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});

        if (userData) {
            res.render('edit-user', {user:userData});
            
        }else{
            res.redirect('/admin/dashboard');
        }
        
    } catch (error) {
        console.log(error);
    }
};

const updateUsers = async(req, res) => {
    try {
        const id = req.body.id;
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
        const verify = req.body.verify

        const updateData = await User.findByIdAndUpdate({_id:id}, { $set:{name:name,email:email,mobile:mobile,is_verified:verify}})

        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error);
    }
};

const deleteUser = async(req, res) => {
    try {
        const id = req.query.id;
        const deletedUser = await User.findByIdAndDelete({_id:id});

        res.redirect('/admin/dashboard');
        
    } catch (error) {
        console.log(error);
    }
}


module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logoutLoad,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser

}