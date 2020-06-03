const Joi = require('@hapi/joi');
const User = require('../models/user');
const Token = require('../models/token');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const {pool} = require('../index');
require('dotenv').config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const schemaTokenEmail = Joi.object({
    email : Joi.string().min(6).email().required()
})

const schemaToken = Joi.object({
    token : Joi.string().min(6).token().required()
})

exports.validateToken = (req, res) => {

    // const {error} = schemaToken.validate(req.params);
    // if (error) res.status(400).send(error.details);
    console.log(req.params);
    return Token.findOne({ token: req.params.token }, async (err, token) => {
        if (!token) return res.status(400).send({message: 'We were unable to find a valid token. Your token may have expired.' });
        return await pool.query('SELECT * FROM users WHERE id = $1', [token._userId], async (error, results) => {
            if (error) 
                return res.status(400).send(error.message);
            else{
                return await pool.query(
                    'UPDATE users SET authenticated = $1, WHERE id = $2',
                    [true, token._userId],
                    (error, results) => {
                        if (error)
                            return res.status(400).send(error.message);
                        else if (results.rows.length == 0)
                            return res.status(400).send({ message: 'We were unable to find a user for this token.' });
                        else if (results.rows[0].authenticated)
                            return res.status(400).send({message: 'This user has already been verified.'});
                        return res.status(200).send("The account has been verified. Please log in.");
                    }
                  )
            }
        })
    });
};

exports.sendTokenPost = function (req, res, next) {

    const {error} = schemaTokenEmail.validate(req.body);
    if (error) res.status(400).send(error.details);
 
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ message: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ message: 'This account has already been verified.' });
 
        const token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
 
        token.save(function (err) {
            if (err) { return res.status(500).send({ message: err.message }); }
            const host = req.get('host');
            const msg = {
                to: user.email,
                from: 'no-reply@matcha.com',
                subject: 'Account Verification Token',
                text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + 
                        host + '\/confirmation\/' + token.token + '.\n',
              };
              sgMail.send(msg);
        });
 
    });
};

