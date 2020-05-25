const router = require('express').Router();
const User = require('../models/user');
const SHA256 = require('crypto-js/sha512');
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const schemaRegister = Joi.object({
    username : Joi.string().min(6).required(),
    email : Joi.string().min(6).required().email(),
    password : Joi.string().min(8).required()
});

const schemaLogin = Joi.object({
    login : Joi.string().min(5).required(),
    password : Joi.string().min(6).required()
});

router.post('/register', async (req,res) => {
    
    const {error} = schemaRegister.validate(req.body);
    if (error) res.status(400).send(error.details);
    
    const date = new Date();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt)

    const user = new User ({
        username : req.body.username, 
        email : req.body.email,
        password : hash,
        hashAuthenticate: SHA256(date.toString() + process.env.SECRET),
        authenticated : false
    });
    try{
        const userSaved = await user.save();
        res.send({id : userSaved._id});
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login',async  (req, res) =>{

    const {error} = schemaLogin.validate(req.body);
    if (error) return res.status(400).send(error.details)

    const userExist = await User.findOne({email : req.body.login}) ||
                        await User.findOne({username : req.body.login});
    if (!userExist) return res.status(400).send({message : "No such user is on system"});

    // if (!userExist.authenticated) return res.status(400).send({message : "Please validate email"});

    const userAuth = bcrypt.compare(req.body.password , userExist.password)
    if (!userAuth) return res.status(400).send({message : "Invalid password"})

    const token = jwt.sign({_id : userExist._id}, process.env.SECRET)
    res.header('auth-token', token).send("Success")
});

router.post('/emailAuth/:auth', async (req, res) => {
    const emailAuth = await User.findOneAndUpdate({hashAuthenticate : req.params.auth}, 
                                                   {authenticated : true});
    if (!emailAuth) return res.status(400).send("No such user found on system");

    res.send(`Email ${emailAuth.email} has been authenticated !`);
});

module.exports = router;