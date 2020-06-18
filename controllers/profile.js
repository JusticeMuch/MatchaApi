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
const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');

const schemaRegister = Joi.object({
    username : Joi.string().min(6).required(),
    firstname : Joi.string().min(3).required(),
    lastname : Joi.string().min(3).required(),
    email : Joi.string().min(6).required().email(),
    password : Joi.string().min(8).required()
});

const schemaLogin = Joi.object({
    email : Joi.string().min(5).required().email(),
    password : Joi.string().min(6).required()
});

const schemaTokenEmail = Joi.object({
    email : Joi.string().min(6).email().required()
})

const schemaToken = Joi.object({
    token : Joi.string().min(6).token().required()
})

const validateToken = (req, res) => {

    const {error} = schemaToken.validate(req.params);
    if (error) res.status(400).send(error.details);
    console.log(req.params);
    return Token.findOne({ token: req.params.token }, async (err, token) => {
        console.log(token._userId);
        if (!token) return res.status(400).send({success : false, error: 'We were unable to find a valid token. Your token may have expired.' });
            return await updateById("Profile", token._userId, {authenticated : true}).then(
              data =>{
                  if (data.length == 0)
                      return res.status(400).send({success : false, Error: 'We were unable to find a user for this token.' });
                  return res.status(200).send({success : true , message :"The account has been verified. Please log in."});
              }).catch(err => res.status(400).send({success : false, Error : err.message}));
    })
}

const sendTokenPost = async (req, res, next) =>{

    const {error} = schemaTokenEmail.validate(req.body);
    if (error) res.status(400).send(error.details);

    const {email} = req.body;
 
    return await getFiltered("Profile", "email", email, "id, email").then(async (data) =>{
        if (data.length == 0)
            return res.status(400).send({message : "No such user is on system or email has already been validated"});
        else{
            try{
                let token = await Token.findOne({ _userId: data[0].id});
                    token.token = crypto.randomBytes(16).toString('hex');
                return await token.save(async function(err, token) {
                    if (err) { return res.status(500).send({ message: err.message }); }
                    if (!token) return res.status(400).send("Token did not save");
                    const msg = {
                        from: 'no-reply@matcha.com',
                        to: email,
                        subject: 'Account Verification Token',
                        text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://localhost:5000/api/user/confirmation/${token.token}`
                      };
                      await sgMail.send(msg);
                      return await res.send({success : true, id : data[0].id , msg : 'email confirmation sent'});
                });
            }catch(err){
                return res.status(400).send({success : false , Error : err.message});
            }
        }
    }).catch(err => res.status(400).send({success : false, Error : err.message}))
};

const register = async (req,res) => {
    const {error} = await schemaRegister.validate(req.body);
    if (error) res.status(400).send({success : false , Error : error.details});
    
    const {username, email, password, firstname, lastname} = req.body; 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const obj = {email : email, firstname : firstname, lastname : lastname , username : username , password : hash};
    await prof.createProfile(req, res, obj);
}

const login = async (req, res) =>{

    const {error} = await schemaLogin.validate(req.body);
    if (error) return res.status(400).send({success : false, Error : error.details})

    const {email, password} = req.body;

    return await getFiltered("Profile", "email", email,"authenticated, password, id").then(
      async (data) =>{
        const valid = await bcrypt.compare(password, data[0].password);

        if (data.length == 0)
            return res.status(400).send({success : false, Error : "No such user is on system"});
        else if (!data[0].authenticated)
            return res.status(400).send({success : false, Error : "Please validate email"});
        else if (!valid)
            return res.status(400).send({success : false, Error : "Invalid password"});
        else{
            console.log(data);
            const token = jwt.sign({_id : data[0].id}, process.env.SECRET);
            res.header('auth-token', token).send({success : true, data : {id : data[0].id}});
        }
      }).catch(error => res.status(400).send({sucess : false, Error : error.message}));
}

const resetPassword = async (req, res) => {
    const {error} = schemaTokenEmail.validate(req.body);
    if (error) res.status(400).send({success : false, Error : error.details});
    
    const {email} = req.body;

    return await getFiltered("Profile", "email", email, "id").then(
      async (data) => {
        if (data.length == 0)
            return res.status(400).send({message : "No such user is on system"});
        else{
            const password = await crypto.randomBytes(6).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            return await updateById("Profile", data[0].id, {password : hash}).then(async (data) =>{
                if (data.length == 0)
                  return res.status(400).send({success : false, message: 'We were unable to find a user for this email' });

                    const msg = {
                        from: 'no-reply@matcha.com',
                        to: email,
                        subject: 'Password has changed as requested',
                        text: `Hello,\n\n Please note that your new password is the follwing , \n Password : ${password}`
                      };
                    await sgMail.send(msg);
                    return res.status(200).send({success : true , message :"Password has been changed and an email has been sent with the new password."});
            })
        }
      }).catch(err => res.status(400).send({success : false,Error : err.message}));
  }                  

const updateUsers = async (req, res) => {//must still test
  const {id} = req.body;
    return await updateById("Profile", id, checkField(req.body, prof.profileKeys)).then(async (data) => {
      if (data.length == 0)
        return res.status(400).send({success : false, Error: 'This users values could not be updated'});
      else
        return res.status(200).send({success : true, message:"Users values have been updated has been changed successfully"});
    }).catch(err => res.status(400).send({success : false, Error : err.message}))
}

const changePassword = async (req, res) => { //must still test
    const {oldPassword, newPassword, id} = req.body;
    return await getFiltered("Profile", "id", id, "password").then(async (data) => {
      if (data.length == 0)
            return res.status(400).send({success : false, Error : "No such user is on system"});
        else if (!bcrypt.compare(oldPassword , data[0].password))
            return res.status(400).send({success: false, Error : "Wrong old password"});
        else{
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            return await updateById("Profile", id, {password : hash}).then(data => {
              if (data.length == 0)
                return res.status(400).send({success : false, Error: 'This password could not be updated' });
              else
                return res.status(200).send({success : true, message:"Password has been changed successfully"})
            }).catch(err => res.status(400).send({success : false, Error : err.message}))
        }
    }).catch(err => res.status(400).send({success : false, Error : err.message}))
}

module.exports = {register, login, sendTokenPost, validateToken, resetPassword, changePassword, updateUsers}