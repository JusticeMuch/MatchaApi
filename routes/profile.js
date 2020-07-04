const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {updateUsers, uploadImage, deleteImage, getProfileData, updateLocation, changePassword} = require('../controllers/profile');
require('dotenv').config();

router.post('/updateProfile', updateUsers);
router.post('/uploadImage', upload.single('image'), uploadImage);
router.post('/deleteImage', deleteImage);
router.post('/getProfile', getProfileData);
router.post('/updateLocation', updateLocation)
router.post('/changePassword', changePassword);

module.exports = router;