const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {updateUsers, uploadImage, deleteImage, getProfileData, updateLocation} = require('../controllers/profile');
require('dotenv').config();

router.post('/updateUsers', updateUsers);
router.post('/uploadImage', upload.single('image'), uploadImage);
router.post('/deleteImage', deleteImage);
router.post('/getProfileById', getProfileData);
router.post('/updateLocation', updateLocation)

module.exports = router;