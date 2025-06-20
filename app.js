const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const collegeRoute = require('./routes/collegeModel')
const roomAllocationRoute = require('./routes/room-allocation')
const cors = require('cors');
require('dotenv').config();

app.use(cors());

mongoose.connect('mongodb+srv://CDP:CDP123@cluster0.jqw8bwn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(res=>{console.log("connected to database")})
.catch(err=>{console.log(err)})

app.use(bodyParser.json())
app.use('/collegeModel',collegeRoute)
app.use('/api/room-allocation',roomAllocationRoute)

const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);
app.use('*',(req,res)=>{
    res.status(404).json({
        msg:'bad request'
    })
})

app.use(express.json());

module.exports = app