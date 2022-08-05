const user = require("../models/userModel");

const isLogin = async(req, res, next) => {
    try {
        
        if (req.session.user_id) {
           
        } else {
            res.redirect("/admin");
        }
        next();
    } catch (error) {
        console.log(error);
    }
};


const isLogout = async(req, res, next) => {

    try {
        if (req.session.user_id) {
            res.redirect("/admin/home")
        } else {
            
        }
        next();
    } catch (error) {
        console.log(error);
    }
};



module.exports = {
    isLogin,
    isLogout
}