const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {register, login, sendTokenPost, validateToken, resetPassword} = require('../controllers/profile');
require('dotenv').config();
const {Report} = require('../models/report');
const report = new Report();

router.post('/sendConfirmation', sendTokenPost);
router.get('/confirmation/:token', validateToken);
router.post('/register', register);
router.post('/login', login);
router.post('/resetPassword', resetPassword);
router.post('/suspend', report.suspendUser);
    
module.exports = router;