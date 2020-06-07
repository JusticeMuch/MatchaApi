const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.PG_USERNAME,
    host: 'localhost',
    database: 'matcha',
    password: process.env.PG_PASSWORD,
    port: 5432
});

const schemaRegister = Joi.object({
    username : Joi.string().min(6).required(),
    email : Joi.string().min(6).required().email(),
    password : Joi.string().min(8).required(),
    firstName : Joi.string().min(3).required(),
    lastName : Joi.string().min(3).required()
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
        if (!token) return res.status(400).send({message: 'We were unable to find a valid token. Your token may have expired.' });
            return await pool.query(
                "UPDATE users SET authenticated = $1 WHERE id = $2",
                [true, token._userId],
                (error, results) => {
                    console.log(results);
                    if (error)
                        return res.status(400).send(error.message);
                    else if (results.rowCount == 0)
                        return res.status(400).send({ message: 'We were unable to find a user for this token.' });
                    return res.status(200).send("The account has been verified. Please log in.");
                }
              )
            });
};

const sendTokenPost = async (req, res, next) =>{

    const {error} = schemaTokenEmail.validate(req.body);
    if (error) res.status(400).send(error.details);

    const {email} = req.body;
 
    return await pool.query('SELECT * FROM users WHERE email = $1 AND authenticated = $2', [email, false], async (error, results) => {
        if (error) {
          return res.status(400).send(error.message);
        }
        console.log(results);
        if (results.rows.length == 0)
            return res.status(400).send({message : "No such user is on system"});
        else{
            try{
                let token = await Token.findOne({ _userId: results.rows[0].id});
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
                      return await res.send({id : results.rows[0].id , msg : 'email confirmation sent'});
                });
            }catch(err){
                return res.status(400).send(err);
            }
        }

    })
};

const register = async (req,res) => {
    const {error} = await schemaRegister.validate(req.body);
    if (error) res.status(400).send(error.details);
    
    const {username, email, password, firstName, lastName} = req.body; 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return await pool.query("INSERT INTO users (username, email, password) VALUES \
        ($1, $2, $3, $4 , $5) RETURNING id", [username, email, firstName, lastName, hash], 
          async (error, results) => {
            if (error) 
                return res.status(200).send(error);
                console.log(results.rows[0].id)

            try{
                console.log("User ID :"+results.rows[0].id);
                const token = new Token({ _userId: results.rows[0].id, token: crypto.randomBytes(16).toString('hex') });
                return await token.save(async function(err) {
                    if (err) { return res.status(500).send({ message: err.message }); }
                    const msg = {
                        from: 'no-reply@matcha.com',
                        to: email,
                        subject: 'Account Verification Token',
                        text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://localhost:5000/api/user/confirmation/${token.token}`
                      };
                      await sgMail.send(msg);
                      return await res.send({id : results.rows[0].id});
                });
            }catch(err){
                return res.status(400).send(err);
            }
        });
}
const login = async (req, res) =>{

    const {error} = await schemaLogin.validate(req.body);
    if (error) return res.status(400).send(error.details)

    const {email, password} = req.body;

    return await pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
          return res.status(400).send(error.message);
        }
        if (results.rows.length == 0)
            return res.status(400).send({message : "No such user is on system"});
        else if (!results.rows[0].authenticated)
            return res.status(400).send({message : "Please validate email"});
        else if (!bcrypt.compare(password , results.rows[0].password))
            return res.status(400).send({message : "Invalid password"});
        else{
            const token = jwt.sign({_id : results.rows[0].id}, process.env.SECRET)
            res.header('auth-token', token).send("Success")
        }

    })
}

const resetPassword = async (req, res) => {
    const {error} = schemaTokenEmail.validate(req.body);
    if (error) res.status(400).send(error.details);

    return await pool.query('SELECT * FROM users WHERE email = $1', [email], async (error, results) => {
        if (error) {
          return res.status(400).send(error.message);
        }
        if (results.rows.length == 0)
            return res.status(400).send({message : "No such user is on system"});
        else{
            const password = await crypto.randomBytes(6).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            return await pool.query(
                "UPDATE users SET password = $1 WHERE id = $2",
                [hash, results.rows[0].id],
                async (error, results) => {
                    console.log(results);
                    if (error)
                        return res.status(400).send(error.message);
                    else if (results.rowCount == 0)
                        return res.status(400).send({ message: 'We were unable to find a user for this email' });

                    const msg = {
                        from: 'no-reply@matcha.com',
                        to: email,
                        subject: 'Account Verification Token',
                        text: `Hello,\n\n Please note that your new password is the follwing , \n Password : ${password}`
                      };
                    await sgMail.send(msg);
                    return res.status(200).send("Password has been changed and an email has been sent with the new password.");
                }
              )
        }
    })
}

const updateUsers = async (req, res) => {//must still test
    const {username, email, id} = req.body;
    return await pool.query(
        "UPDATE some_table SET \
        username = COALESCE($1, username),\
        email = COALESCE($2, email) \
      WHERE id = $3; \
      AND  (param_1 IS DISTINCT FROM username OR \
            param_2 IS DISTINCT FROM email);"),
        [username, email, id],
        async (error, results) => {
            if (error)
                return res.status(400).send(error.message);
            else if (results.rowCount == 0)
                return res.status(400).send({ message: 'This users values could not be updated' });
            else
                return res.status(200).send({message:"Password has been changed successfully"});
        }
}

const changePassword = async (req, res) => { //must still test
    const {oldPassword, newPassword} = req.body;
    return await pool.query('SELECT password FROM users WHERE email = $1', [email], (error, results) => {
        if (error) {
          return res.status(400).send(error.message);
        }
        if (results.rows.length == 0)
            return res.status(400).send({message : "No such user is on system"});
        else if (!bcrypt.compare(oldPassword , results.rows[0].password))
            return res.status(400).send({message : "Wrong old password"});
        else{
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(newPassword, salt);
            return await pool.query(
                "UPDATE users SET password = $1 WHERE email = $2 ",
                [hash, email],
                async (error, results) => {
                    if (error)
                        return res.status(400).send(error.message);
                    else if (results.rowCount == 0)
                        return res.status(400).send({ message: 'This password could not be updated' });
                    else
                        return res.status(200).send({message:"Password has been changed successfully"})
            });
        }

    })
}

module.exports = {register, login, sendTokenPost, validateToken, resetPassword, changePassword, updateUsers}

