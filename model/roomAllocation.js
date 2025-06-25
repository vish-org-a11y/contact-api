const mongoose = require('mongoose')

const roomAllocationSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    roomName:{type:String, required:true},
    capacity:{type:String,required:true},
    floorName:{type:String,required:true},
    startRollNo: { type: String, required: true },
    endRollNo: { type: String, required: true },
    collegeName:{type:String,required:true},
    collegeCode:{type:String,required:true}
})

module.exports = mongoose.model('RoomAllocation',roomAllocationSchema);