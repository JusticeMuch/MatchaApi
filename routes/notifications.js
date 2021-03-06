const router = require('express').Router();
const multer = require('multer');
const {Report} = require('../models/report');
const report = new Report();

const {
    likeCreate,
    visitCreate,
    blockCreate,
    updateRead,
    likesGet,
    visitsGet,
    matchesGet,
    messageCreate,
    messageGet,
    messageCount,
    likesCount,
    matchesCount,
    blocksGet,
    getMessageById,
    deleteBlock,
    likeDelete,
    matchDelete,  
    messageDelete,
    getLiked,
    getLikeMatch
} = require('../controllers/notifications')
require('dotenv').config();

router.post('/visit', visitCreate);
router.post('/like', likeCreate);
router.post('/block', blockCreate);
router.post('/message', messageCreate);
router.put('/message/read', updateRead);
router.get('/visit', visitsGet);
router.get('/like', likesGet);
router.get('/match', matchesGet);
router.get('/message', messageGet);
router.get('/block', blocksGet);
router.get('/like/count', likesCount);
router.get('/match/count', matchesCount);
router.get('/message/count', messageCount);
router.post('/report', report.createReport);
router.get('/message/matchid', getMessageById);
router.delete('/block', deleteBlock);
router.delete('/like', likeDelete);
router.delete('/match', matchDelete);
router.delete('/message', messageDelete);
router.get('/liked', getLiked);
router.get('/likeMatch', getLikeMatch);

module.exports = router;
