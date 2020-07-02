const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {register, login, sendTokenPost, validateToken, resetPassword, changePassword} = require('../controllers/profile');
require('dotenv').config();

router.post('/sendConfirmation', sendTokenPost);
router.get('/confirmation/:token', validateToken);
router.post('/register', register);
router.post('/login', login);
router.post('/resetPassword', resetPassword);
router.post('/changePassword', changePassword);
    
module.exports = router;