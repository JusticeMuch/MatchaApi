const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {register, login, sendTokenPost, validateToken, resetPassword, changePassword, updateUsers, uploadImage, 
    deleteImage, getProfileData, updateLocation} = require('../controllers/profile');
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
router.post('/getProfileById', getProfileData);
router.post('/updateLocation', updateLocation)
    
module.exports = router;