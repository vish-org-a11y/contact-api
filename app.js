const express = require('express')
const app = express()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoute = require('./routes/user')
const contactRoute = require('./routes/contact')

console.log("BEFORE connected to database")
mongoose.connect('mongodb+srv://CDP:CDP123@cluster0.jqw8bwn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(res=>{console.log("connected to database")})
.catch(err=>{console.log(err)})

app.use(bodyParser.json())

app.use('/user',userRoute)
app.use('/contact',contactRoute)


app.use('*',(req,res)=>{
    res.status(404).json({
        msg:'bad request'
    })
})

module.exports = app