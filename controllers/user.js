const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
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
    password : Joi.string().min(8).required()
});

const schemaLogin = Joi.object({
    login : Joi.string().min(5).required(),
    password : Joi.string().min(6).required()
});

const register = async (req,res) => {
    console.log('helpsdfsdfsdf');
    const {error} = await schemaRegister.validate(req.body);
    if (error) res.status(400).send(error.details);
    
    const {username, email, password} = req.body; 
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    return await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
         [username, email, hash], async  (error, results) => {

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
                        text: `Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp://localhost:5000/api/user/confirmation/${token.token}`
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

    return await pool.query('SELECT * FROM users WHERE email = $1', [id], (error, results) => {
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
            const token = jwt.sign({_id : userExist._id}, process.env.SECRET)
            res.header('auth-token', token).send("Success")
        }

    })
}

module.exports = {register, login}

