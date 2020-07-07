const router = require('express').Router();
const multer = require('multer');
const {likeCreate, visitCreate, blockCreate, updateRead, likesGet, visitsGet, matchesGet, messageCreate, messageGet} = require('../controllers/notifications')
require('dotenv').config();

router.post('/visit' , visitCreate);
router.post('/like', likeCreate);
router.post('/block', blockCreate);
// router.post('/message', messageCreate);
router.put('/read', updateRead);
router.get('/visit', visitsGet);
router.get('/like', likesGet);
router.get('/matches', matchesGet);
router.get('/message', messageGet);

module.exports = router;