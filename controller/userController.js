const User = require("../models/userModel");
const bcrypt =require("bcrypt");
const nodemailer = require("nodemailer");
const randomstring = require('randomstring');
const config = require("../config/config");
const { findByIdAndUpdate } = require("../models/userModel");

const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;
        
    } catch (error) {
        console.log(error.message);
    }       
};

// send verification mail --------------

const sendVerifyMail = async(name , email, user_id) =>{

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
            subject:'for verification mail',
            html:'<p>jai Ram ji ki ' +name+',<br> please click here to <a href="http://localhost:4000/verify?id='+user_id+'">Verify</a> Your mail. </p>'
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

// send reset password mail 


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
            html:'<p>jai Ram ji ki ' +name+',<br> please click here to <a href="http://localhost:4000/forget-password?token='+token+'">Reset</a> Your Password. </p>'
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

// loadRegister --------------

const loadRegister = async(req, res) => {
    try {

        res.render("registration");

    } catch (error) {
        res.send(error.message)
    }
};

const insterUser = async(req, res) =>{
    try {
        const sPassword = await securePassword(req.body.password);

        const user = new User({
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mobile,
        image:req.file.filename,
        password:sPassword,
        is_admin:0
    });
    const userData = await user.save();

    if(userData){
        sendVerifyMail(req.body.name, req.body.email, userData._id);
        res.render("registration", {message:"your Registration has been successfully ! Please verify your Email..."});
    }else{
        res.render("registration", {message:"your Registration has been failed !"});
    }
    } catch(error){
        console.log(error.message);
    }
   
};


// verifyMail -----------------------

const verifyMail = async(req, res) => {
    try {

        const updateInfo = await User.updateOne({_id:req.query.id}, { $set:{ is_verified:1}})

        console.log(updateInfo);
        res.render("email-verified");
        
    } catch (error) {
        console.log(error.message);
    }
};

// login methods started ------------

const loginLoad = async(req, res) => {
    try {
        
        res.render("login");

    } catch (error) {
        console.log(error.message)
    }
}

const verifyLogin = async(req, res ) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if (userData) {
                const result  = await bcrypt.compare(password, userData.password )
                 console.log("login successfully");

                if (result) {

                    if (userData.is_verified == 0) {
                        res.render("login", {message:"Email is non verified . Please chacke your Email"})
                    }else{
                        req.session.user_id = userData._id;
                        res.redirect("home");
                    }
                }else{
                    res.render("login", {message:"invalid Password . Please chacke your Password"})

                }
        }else{
            res.render("login", {message:"invalid Email . Please chacke your Email"})
        }
        
        
    } catch (error) {
        console.log(error.message);
    }
};

const loadHome = async(req, res) => {
    try {
        
        const userData = await User.findById({_id:req.session.user_id});

        res.render("home", {user: userData});

    } catch (error) {
      console.log(error.message)  
    }
};

const userLogout = async(req, res) => {
    try {
        
        req.session.destroy();
        res.redirect("/");

    } catch (error) {
        console.log(error.message);
    }
};

// forget password -------------- 

const forgetLoad = async(req, res) => {
    try {
        res.render("forget");
        
    } catch (error) {
        console.log(error.message);
    }
};

const forgetVerify = async(req, res) => {
    try {
        
        const email = req.body.email;
        const userData = await User.findOne({email:email});

        if (userData ) {


           if (userData.is_verified === 0) {
            res.render('forget', {message:"Please verify your Email"});
            
           } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email:email},{ $set:{token:randomString}});

                sendResetPasswordMail(userData.name, userData.email, randomString)
                res.render('forget', {message:"Please check your mail to your Reset Password. "});
            }


        }else{
            res.render('forget', {message:"User Email is incorrect"});
        }

    } catch (error) {
        console.log(error.message);
    }
};

const forgetPasswordLoad  = async(req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({token:token})
        if (tokenData) {
            res.render("forget-password", {user_id:tokenData._id})
            
        } else {
            res.render("404", {message:'404, page not Found'})
        }
        
    } catch (error) {
        console.log(error.message);
    }
};

const resetPassword = async(req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        console.log(user_id);
        const sPassword = await securePassword(password);

        console.log("before data password");

        const result = await User.findByIdAndUpdate({_id:user_id}, { $set:{password:sPassword, token:''}});

        res.redirect("/");
        
    } catch (error) {
        console.log(error);
    }
};

const verificationLoad = async(req, res) => {
    try {
        res.render("verification")
    } catch (error) {
        console.log(error);
    }
};

const sendVerificationLink = async(req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if (userData) {
            if (userData.is_verified === 0) {
                sendVerifyMail(userData.name, userData.email, userData._id);
                res.render("verification", {message:"Resend verification mail. Please check Your Email..!"})
            } else {
            res.render("verification", {message:"You are already verified..!"})
        }

        } else {
            res.render("verification", {message:"The Email is not exist..!"})
        }
        
    } catch (error) {
       console.log(error) 
    }
};

const editLoad = async(req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id:id});
        if (userData) {
            res.render("edit", {user: userData});
        } else {
            res.redirect("/home")
        }
        
    } catch (error) {
        console.log(error);
    }
};

const updateProfile = async(req, res) => {
    try {
        const user_id = req.body.user_id
        const name = req.body.name;
        const email = req.body.email;
        const mobile = req.body.mobile;
       
        if (req.file) {
            const resut = await User.findByIdAndUpdate({_id:user_id}, { $set:{name:name,email:email, mobile:mobile, image:req.file.filename}});
        } else {

            const resut = await User.findByIdAndUpdate({_id:user_id}, { $set:{name:name,email:email, mobile:mobile}});
        }
        res.redirect("/home");

    } catch (error) {
        console.log(error);
    }
}



module.exports = {
    loadRegister,
    insterUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerificationLink,
    editLoad,
    updateProfile
}



