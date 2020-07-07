const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest : null});
const {updateUsers, uploadImage, deleteImage, getProfileData, updateLocation, changePassword} = require('../controllers/profile');
require('dotenv').config();

router.put('/', updateUsers);
router.post('/image', upload.single('image'), uploadImage);
router.delete('/image', deleteImage);
router.get('/', getProfileData);
router.put('/location', updateLocation)
router.post('/changePassword', changePassword);

module.exports = router;