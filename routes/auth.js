const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {register, login, sendTokenPost, validateToken, resetPassword, changePassword, updateUsers, uploadImage, deleteImage} = require('../controllers/profile');
require('dotenv').config();

router.post('/sendConfirmation', sendTokenPost);
router.get('/confirmation/:token', validateToken);
router.post('/register', register);
router.post('/login', login);
router.post('/resetPassword', resetPassword);
router.post('/changePassword', changePassword);
router.post('/updateUsers', updateUsers);
router.post('/uploadImage', upload.single('image'), uploadImage);
router.post('/deleteImage', deleteImage);
    
module.exports = router;