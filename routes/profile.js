const router = require('express').Router();
const multer = require('multer');
const upload = multer({dest: null});
const {
    updateUsers,
    uploadImage,
    deleteImage,
    getProfileData,
    updateLocation,
    changePassword,
    getAllProfiles,
    checkOnline,
    deleteProfile
} = require('../controllers/profile');
const filterProfiles = require('../controllers/filter');
require('dotenv').config();


router.put('/', updateUsers);
router.get('/all', getAllProfiles);
router.post('/image', upload.single('image'), uploadImage);
router.delete('/image', deleteImage);
router.get('/', getProfileData);
router.put('/location', updateLocation)
router.post('/changePassword', changePassword);
router.post('/filter', filterProfiles);
router.get('/online', checkOnline);
router.post('/', deleteProfile);

module.exports = router;
