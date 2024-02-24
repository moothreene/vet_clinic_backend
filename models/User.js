const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email:{type:String, required:true, min:4, unique:true},
    password:{type:String, required:true},
    isAdmin:{type:Boolean, default:false}
})

const UserModel = mongoose.model("User",UserSchema,"Users");

module.exports = UserModel;