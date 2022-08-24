const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const UserModel = require('../models/userModel');

const env = require('dotenv').config()

const accountSid = process.env.accountSID
const authToken = process.env.authToken
const client = require('twilio')(accountSid, authToken);

module.exports={
    userCheck:(email)=>{
        console.log(email);
        return new Promise(async(resolve,reject)=>{
            let user = await UserModel.findOne({email})
            let status = {
                check:false
            }
            if(user){
                status.check=true
                status.user=user
                resolve(status)
            }else{
                resolve(status)
            }
        })

    },
    checkMobile:(mobile)=>{
        return new Promise(async(resolve,reject)=>{
            let user = await UserModel.findOne({mobile})
            console.log(user)
            console.log(mobile)
            let status = {
                check:false
            }
            if(user){
                status.check=true
                status.user=user
                resolve(status)
            }else{
                resolve(status)
            }
        })
    },  
sendOtp: (mobile) => {
                    console.log(mobile)
                    return new Promise((resolve, reject) => {
                        client.verify.v2.services(process.env.serviceID)
                            .verifications
                            .create({ to: '+91' + mobile, channel: 'sms' })
                            .then(verification => {
                                console.log(mobile);
                                console.log(verification.status)
                                resolve(verification)
                            });
                    })
            
                },
                verifyOtp: (otp, mobile) => {
                    return new Promise((resolve, reject) => {
                        client.verify.v2.services(process.env.serviceID)
                            .verificationChecks
                            .create({ to: '+91' + mobile, code: otp })
                            .then((verification_check) => {
                                console.log(verification_check.status)
                                resolve(verification_check.status)
                            });
                    })
                }
            }