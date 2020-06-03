const router = require('express').Router();
const sendToken = require('../controllers/sendEmail');
require('dotenv').config();
const {register, login} = require('../controllers/user');


router.post('/sendConfirmation', sendToken.sendTokenPost);
router.get('/confirmation/:token', sendToken.validateToken);
router.post('/register', register);
router.post('/login', login);
router.post('/resetPassword', )
    

module.exports = router;