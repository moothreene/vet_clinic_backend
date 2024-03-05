const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email:{type:String, required:true, min:4, unique:true},
    firstName:{type:String, required:true, min:2},
    lastName:{type:String, required:true, min:2},
    phoneNumber:{type:String, required:true, min:7, unique:true},
    password:{type:String, required:true},
    isDoctor:{type:Boolean, default:false}
})

const UserModel = mongoose.model("User",UserSchema,"Users");

module.exports = UserModel;