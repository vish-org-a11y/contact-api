const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const CollegeModel = require('../model/collegeModel')
const collegeMaster = require('../model/collegeMaster')

//signup api
router.post('/signup', (req, res) => {
    console.log('signup post request')

    CollegeModel.find({ email: req.body.email })
        .then(result => {
            if (result.length > 0) {
                return res.status(500).json({
                    msg: 'email already exist'
                })
            }

            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        error: err
                    })
                }

                const newCollegeModel = new CollegeModel({
                    _id: new mongoose.Types.ObjectId,
                    collegeName: req.body.collegeName,
                    collegeCode: req.body.collegeCode,
                    email: req.body.email,
                    password: hash
                })
                newCollegeModel.save()
                
                new collegeMaster({
                    collegeName: req.body.collegeName,
                    collegeCode: req.body.collegeCode
                }).save()
                    .then(result => {
                        const token = jwt.sign({
                            collegeName: result.collegeName,
                            collegeCode: result.collegeCode,
                            email: result.email,
                            userId: result._id
                        },
                            process.env.JWT_SECRET,
                            {
                                expiresIn: "365d"
                            }
                        )
                        res.status(200).json({
                            collegeName: result.collegeName,
                            collegeCode: result.collegeCode,
                            email: result.email,
                            userId: result._id,
                            token: token
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        })
                    })

            })

        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })


})


// login api

router.post('/login', (req, res) => {
    console.log(req.body)
    CollegeModel.find({ email: req.body.email })
        .then(collegeModel => {
            console.log(collegeModel)
            if (collegeModel.length < 1) {
                return res.status(401).json({
                    msg: 'college not exist'
                })
            }

            const bcrypt = require('bcryptjs');


            bcrypt.compare(req.body.password, collegeModel[0].password, (err, result) => {
                if (!result) {
                    return res.status(401).json({
                        msg: 'invalid password'
                    })
                }

                //creating token
                const token = jwt.sign({
                    collegeName: collegeModel[0].collegeName,
                    collegeCode: collegeModel[0].collegeCode,
                    email: collegeModel[0].email,
                    userId: collegeModel[0]._id
                },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "365d"
                    }
                )

                res.status(200).json({
                    collegeName: collegeModel[0].collegeName,
                    collegeCode: collegeModel[0].collegeCode,
                    email: collegeModel[0].email,
                    userId: collegeModel[0]._id,
                    token: token
                })
            })

        })
        .catch(err => {
            console.log(err)
        })
})

//check user
router.get('/checkEmail/:email', (req, res) => {
    CollegeModel.find({ email: req.params.email })
        .then(result => {
            if (result.length > 0) {
                return res.status(200).json({
                    isAvailable: true
                })
            }
            res.status(200).json({
                isAvailable: false
            })

        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;

