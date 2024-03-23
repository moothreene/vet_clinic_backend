const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema({
    owner_id:{type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    name:{type:String,required:true,min:2},
    sex:{type:String, required:true},
    weight:{type:Number},
    birthday:{type:Date,required:true},
    species:{type:String, required:true, min:3},
    breed:{type:String},
})

const PetModel = mongoose.model("Pet",PetSchema,"Pets");

module.exports = PetModel;