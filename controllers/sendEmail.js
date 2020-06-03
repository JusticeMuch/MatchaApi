const Joi = require('@hapi/joi');
const Token = require('../models/token');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.PG_USERNAME,
    host: 'localhost',
    database: 'matcha',
    password: process.env.PG_PASSWORD,
    port: 5432
});

require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const schemaTokenEmail = Joi.object({
    email : Joi.string().min(6).email().required()
})

const schemaToken = Joi.object({
    token : Joi.string().min(6).token().required()
})

exports.validateToken = (req, res) => {

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

exports.sendTokenPost = async (req, res, next) =>{

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

