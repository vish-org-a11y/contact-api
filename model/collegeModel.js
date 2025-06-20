const mongoose = require('mongoose')

const collegeModelSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    collegeName:{type:String,required:true},
    collegeCode:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})

module.exports = mongoose.model('CollegeModel',collegeModelSchema);