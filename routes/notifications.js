const router = require('express').Router();
const multer = require('multer');
const {likeCreate, visitCreate, blockCreate, updateRead, likesGet, visitsGet, matchesGet, messageCreate, messageGet, messageCount, likesCount, matchesCount} = require('../controllers/notifications')
require('dotenv').config();

router.post('/visit' , visitCreate);
router.post('/like', likeCreate);
router.post('/block', blockCreate);
router.post('/message', messageCreate);
router.put('/message/read', updateRead);
router.get('/visit', visitsGet);
router.get('/like', likesGet);
router.get('/match', matchesGet);
router.get('/message', messageGet);
router.get('/like/count', likesCount);
router.get('/match/count', matchesCount);
router.get('/message/count', messageCount);

module.exports = router;