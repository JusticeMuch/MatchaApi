const router = require('express').Router();
const multer = require('multer');
const {likeCreate, visitCreate, blockCreate} = require('../controllers/notifications')
require('dotenv').config();

router.post('/visit' , visitCreate);
router.post('/like', likeCreate);
router.post('/block', blockCreate);

module.exports = router;