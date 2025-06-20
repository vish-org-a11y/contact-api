const mongoose = require('mongoose')

const collegeMasterSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    collegeName:{type:String,required:true},
    collegeCode:{type:String,required:true}
})

module.exports = mongoose.model('CollegeMaster',collegeMasterSchema);