const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');
const {db, pgp} = require('../db');
const {Profile} = require('../models/profiles');
const prof = new Profile();
const request = require('request');
require('dotenv').config();
const unirest = require("unirest");
const {checkUserOnline} = require('../socket')
var FormData = require('form-data');

const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');

const schemaRegister = Joi.object({
    username: Joi.string().min(6).required(),
    firstname: Joi.string().min(3).required(),
    lastname: Joi.string().min(3).required(),
    email: Joi.string().min(6).required().email(),
    password: Joi.string().min(8).required()
});


const schemaLogin = Joi.object({email: Joi.string().min(5).required().email(), password: Joi.string().min(6).required()});

const schemaTokenEmail = Joi.object({email: Joi.string().min(6).email().required()})

const schemaToken = Joi.object({token: Joi.string().min(6).token().required()})

const schemaUpdate = Joi.object({
    username: Joi.string().min(3),
    firstname: Joi.string().min(3),
    lastname: Joi.string().min(3),
    email: Joi.string().email(),
    gender: Joi.string(),
    description: Joi.string(),
    interests: Joi.array(),
    last_visit: Joi.string(),
    popularity: Joi.number(),
    birthdate: Joi.date(),
    sexual_preference: Joi.string(),
    sexual_orientation: Joi.string()
})

const validateToken = (req, res) => {

    const {error} = schemaToken.validate(req.params);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    return Token.findOne({
        token: req.params.token
    }, async (err, token) => {
        console.log(token._userId);
        if (!token) 
            return res.status(400).send({success: false, error: 'We were unable to find a valid token. Your token may have expired.'});
        
        return await updateById("Profile", token._userId, {authenticated: true}).then(data => {
            if (data.length == 0 || !data) 
                return res.status(400).send({success: false, Error: {message :'We were unable to find a user for this token.'}});
            
            return res.status(200).send({success: true, message: "The account has been verified. Please log in."});
        }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}));
    })
}

const sendTokenPost = async (req, res, next) => {

    const {error} = schemaTokenEmail.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {email} = req.body;

    return await getFiltered("Profile", "email", email, "id, email").then(async (data) => {
        if (data.length == 0) 
            return res.status(400).send({message: "No such user is on system or email has already been validated"});
         else {
            try {
                let token = await Token.findOne({_userId: data[0].id});
                token.token = crypto.randomBytes(16).toString('hex');
                return await token.save(async function (err, token) {
                    if (err) {
                        return res.status(500).send({success : false, Error : {message : err.message}});
                    }
                    if (! token) 
                        return res.status(400).send("Token did not save");
                    
                    const msg = {
                        from: 'no-reply@matcha.com',
                        to: email,
                        subject: 'Account Verification Token',
                        text: `Hello,\n\n Please verify your account by clicking the link: \n${process.env.API_URL}/api/auth/confirmation/${
                            token.token
                        }`
                    };
                    await sgMail.send(msg);
                    return await res.send({success: true, id: data[0].id, message: 'email confirmation sent'});
                });
            } catch (err) {
                return res.status(400).send({success: false, Error: {message : err.message}});
            }
        }
    }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}))
};

const register = async (req, res) => {
    const {error} = await schemaRegister.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {
        username,
        email,
        password,
        firstname,
        lastname
    } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const obj = {
        email: email,
        firstname: firstname,
        lastname: lastname,
        username: username,
        password: hash
    };
    await prof.createProfile(req, res, obj);
}

const login = async (req, res) => {

    const {error} = await schemaLogin.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details})

    

    const {email, password} = req.body;
    console.log(email)

    return await getFiltered("Profile", "email", email, "authenticated, password, suspended, id").then(async (data) => {
        const valid = await bcrypt.compare(password, data[0].password);
        console.log(data);
        if (data.length == 0 || !data) 
            return res.status(400).send({success: false, Error: {message : "No such user is on system"}});
         else if (!data[0].authenticated)
            return res.status(400).send({success: false, Error: {message : "Please validate email"}});
         else if (data[0].suspended)
            return res.status(400).send({success: false, Error: {message : "You are suspended , please contact site administrator"}});
         else if (! valid) 
            return res.status(400).send({success: false, Error: {message : "No such user is on the system"}});
         else {
            const token = jwt.sign({
                _id: data[0].id
            }, process.env.SECRET, { expiresIn: '12h'});
            res.header('auth-token', token).send({
                success: true,
                data: {
                    id: data[0].id,
                    token : token
                }
            });
        }
    }).catch(error =>{
        if (error.message === "Cannot read property 'password' of undefined")
            return res.status(400).send({sucess: false, Error: {message : "No such user in on the system"}});
        else
            return res.status(400).send({sucess: false, Error: {message : error.message}});
    });
}

const resetPassword = async (req, res) => {
    const {error} = schemaTokenEmail.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {email} = req.body;

    return await getFiltered("Profile", "email", email, "id").then(async (data) => {
        if (data.length == 0) 
            return res.status(400).send({message: "No such user is on system"});
         else {
            const password = await crypto.randomBytes(6).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            return await updateById("Profile", data[0].id, {password: hash}).then(async (data) => {
                if (data.length == 0 || !data) 
                    return res.status(400).send({success: false, Error : {message: 'We were unable to find a user for this email'}});
                

                const msg = {
                    from: 'no-reply@matcha.com',
                    to: email,
                    subject: 'Password has changed as requested',
                    text: `Hello,\n\n Please note that your new password is the follwing , \n Password : ${password}`
                };
                await sgMail.send(msg);
                return res.status(200).send({success: true, message: "Password has been changed and an email has been sent with the new password."});
            })
        }
    }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}));
}

const updateUsers = async (req, res) => {
    const {error} = schemaUpdate.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const id = req.user._id;
    const filtered = await checkField(req.body, prof.profileKeys);

    if ('email' in filtered){
        const msg = {
            from: 'no-reply@matcha.com',
            to: filtered['email'],
            subject: 'Email has been changed',
            text: `Hello,\n\n Please note that your email has been changed to this email address that you are receiving this on.`
        };
        await sgMail.send(msg);
    }

    return await updateById("Profile", id, filtered).then(async (data) => {
        if (data.length == 0 || !data) 
            return res.status(400).send({success: false, Error: {message :'This users values could not be updated as the email or username is already in use'}});
         else 
            return res.status(200).send({success: true, message: "Users values have been updated has been changed successfully"});
        
    }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}))
}

const changePassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    const id = req.user._id;

    return await getFiltered("Profile", "id", id, "password").then(async (data) => {
        if (data.length == 0) 
            return res.status(400).send({success: false, Error: {message : "No such user is on system"}});
         else if (! bcrypt.compare(oldPassword, data[0].password)) 
            return res.status(400).send({success: false, Error: {message : "Wrong old password"}});
         else {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            return await updateById("Profile", id, {password: hash}).then(data => {
                if (data.length == 0 || !data) 
                    return res.status(400).send({success: false, Error: {message : 'This password could not be updated'}});
                 else 
                    return res.status(200).send({success: true, message: "Password has been changed successfully"})
                
            }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}))
        }
    }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}))
}

const uploadImage = async (req, res) => {
    const image = req.file;
    const id = req.user._id

    let images = await getFiltered("Profile", "id", id, "images").then((data) => {
        return data[0].images
    });
    if (! images) 
        images = [];
    
    if (images.length >= 5) 
        return res.status(400).send({success: false, Error: {message : "Photo limit of 5 photos is reached"}});
     else {
        const formData = {
            key: process.env.IMGDB_KEY,
            image: {
                value: image.buffer,
                options: {
                    filename: image.originalname,
                    contentType: image.mimetype
                }
            }
        };
        return await request.post({
            url: process.env.IMGDB_EP,
            formData: formData
        }, async (err, httpResponse, body) => {
            if (err) {
                console.error('ImageToLink upload failed:', err);
                return null
            }
            const url = JSON.parse(body).data.image.url;
            images.push(url);
            return await updateById("Profile", id, {images: images}).then(async (data) => {
                if (data || data.length > 0)
                    return res.send({success: true, message: "images uploaded successfully", url: url})
                else res.status(500).send({success: false, Error: {message : "Photo not uploaded, server error"}});
            }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}));
        });

    }
}

const deleteImage = async (req, res) => {
    const {image} = req.body;
    const id = req.user._id

    if (!image || image == undefined) 
        return res.status(400).send({success: false, Error: "Field 'image' is blank"});
    
    let images = await getFiltered("Profile", "id", id, "images").then(data => {
        return data[0].images
    });
    const len = (await images).length;
    const imagesFiltered = (await images).filter((value) => value != image);
    if (imagesFiltered.length == len) 
        return res.status(400).send({success: false, Error: {message :"Photo url sent is not in db as such it cant be deleted"}});
     else {
        updateById("Profile", id, {images: imagesFiltered}).then().catch(err => res.status(400).send({success: false, Error: {message : err.message}}));
        return res.send({success: true, message: "image has been deleted"});
    } id
}

const getProfileData = async (req, res, next) => {
    const data = await getBy("id", req.user._id, "Profile").then(data => {
        return data[0]
    }).catch(err => {
        return res.status(400).send({success: false, Error: {message : err.message}})
    });
    delete data.password;
    if (!data || data.length == 0) 
        return await res.status(400).send({success: false, Error:{message : "No results"}});
     else 
        return await res.send({success: true, data: data});
    
}

const updateLocation = async (req, res) => {
    const id = req.user._id
    let ip = null;

    if (req.headers['x-forwarded-for']) 
        ip = req.headers['x-forwarded-for'].split(",")[0];
     else if (req.connection && req.connection.remoteAddress) 
        ip = req.connection.remoteAddress;
     else 
        ip = req.ip;
    

    let request = unirest("GET", "https://ip-geolocation-ipwhois-io.p.rapidapi.com/json/");

    request.query({"ip": ip});

    request.headers({"x-rapidapi-host": "ip-geolocation-ipwhois-io.p.rapidapi.com", "x-rapidapi-key": process.env.LOCATION_API_KEY, "useQueryString": true});

    return await request.end(async (response) => {
        if (response.error) 
            return res.status(400).send({success: false, Error: response.error});
         else {
            const lat = response.body.latitude;
            const long = response.body.longitude;
            return await updateById("Profile", id, {
                location: [parseFloat(lat), parseFloat(long)]
            }).then(async (data) => {
                res.send({success: true, latitude: lat, longitude: long});
            }).catch(err => res.status(400).send({success: false, Error: {message : err.message}}));
        }
    });
}

const checkOnline = async (req,res) => {
    const {user} = req.query;

    if (user == undefined || !user)
        res.status(400).send({success :false, Error :{message : 'User field is undefined or empty'}});
    else{
        let result = await checkUserOnline(user);
        console.log(result);
        return await res.send({success : true, data :{user : user , online : result }})
    }
}

const deleteProfile = prof.deleteById;


const getAllProfiles = prof.getAllProfiles;

module.exports = {
    register,
    login,
    sendTokenPost,
    validateToken,
    resetPassword,
    changePassword,
    updateUsers,
    uploadImage,
    deleteImage,
    getProfileData,
    updateLocation,
    getAllProfiles,
    checkOnline,
    deleteProfile
}
