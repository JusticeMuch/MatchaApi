const router = require('express').Router();
const Token = require('../models/token');
const SHA256 = require('crypto-js/sha512');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendToken = require('../controllers/sendEmail');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const {register, login} = require('../controllers/user')
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


router.post('/sendConfirmation', sendToken.sendTokenPost);
router.get('/confirmation/:token', sendToken.validateToken);

router.post('/register', register);

router.post('/login', login);
    

module.exports = router;