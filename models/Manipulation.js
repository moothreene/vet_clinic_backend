const mongoose = require("mongoose");

const ManipulationSchema = new mongoose.Schema({
    pet_id:{type:mongoose.Schema.Types.ObjectId,ref:"Pet",required:true},
    date:{type:Date,required:true},
    weight:{type:Number},
    temp:{type:Number},
    purpose:{type:String},
    doctor:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    desc:{type:String},
    recommendation:{type:String}
})

const ManipulationModel = mongoose.model("Manipulation",ManipulationSchema,"Manipulations");

module.exports = ManipulationModel;