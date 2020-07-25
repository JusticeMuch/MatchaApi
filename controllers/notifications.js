const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');
const {db, pgp} = require('../db');
const {Like} = require('../models/like');
const {Visit} = require('../models/visit');
const {Block} = require('../models/block');
const {Profile} = require('../models/profiles');
const {Message} = require('../models/message');
const {Match} = require('../models/match');
const request = require('request');
const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');
const {createMessage, createNotification, emitMessage, emitNotification} = require('../socket');
require('dotenv').config();
const like = new Like();
const visit = new Visit();
const block = new Block();
const profile = new Profile();
const message = new Message();
const match = new Match();

const schemaLike = Joi.object({liked_user: Joi.number().required(), date: Joi.string().required()});

const schemaVisit = Joi.object({visited: Joi.number().required(), date: Joi.string().required()});

const schemaBlock = Joi.object({blocked_user: Joi.number().required(), date: Joi.string().required()})

const schemaMessage = Joi.object({match_id: Joi.number().required(), date: Joi.string().required(), content: Joi.string().required()})

const likeCreate = async (req, res) => { // add match creation
    const {error} = await schemaLike.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {liked_user, date} = req.body;
    const liking_user = req.user._id;

    try {
        await emitNotification(liked_user, createNotification('like', liking_user, liked_user, null));
        await profile.updatePopularity(liked_user, 5);
        return await like.createLike(req, res, {liked_user, liking_user, date});
    } catch (error) {
        return res.status(400).send({success: false, Error: error});
    }

}

const visitCreate = async (req, res) => {
    const {error} = await schemaVisit.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {visited, date} = req.body;
    const visitor = req.user._id;

    try {
        await emitNotification(visited, createNotification('visit', visitor, visited, null));
        await profile.updatePopularity(visited, 2);
        return await visit.createVisit(req, res, {visitor, visited, date});
    } catch (error) {
        return res.status(400).send({success: false, Error: error});
    }
}

const blockCreate = async (req, res) => {

    const {error} = schemaBlock.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {blocked_user, date} = req.body;
    const blocking_user = req.user._id;


    try {
        await emitNotification(blocking_user, createNotification('block', blocked_user, blocking_user, null));
        await profile.updatePopularity(blocked_user, -10);
        return await block.createBlock(req, res, {blocked_user, blocking_user, date});
    } catch (error) {
        return res.status(400).send({success: false, Error: error});
    }
}

const messageCreate = async (req, res) => {
    const {error} = schemaMessage.validate(req.body);
    if (error) 
        return res.status(400).send({success: false, Error: error.details});
    

    const {match_id, date, content} = req.body;
    const author = req.user._id;

    try {
        await emitMessage(match_id, createMessage(author, content));
        return await message.createMessage(req, res, {match_id, author, content, date});
    } catch (error) {
        return res.status(400).send({success: false, Error: error});
    }


}

const updateRead = async (req, res) => {
    const {id} = req.body;
    if (!id || id == undefined) 
        return res.status(400).send({success: false, Error:{message : "ID field is empty or undefined"}});
    

    try {
        await message.updateRead(id);
        return res.status(200).send({success: true, message: "Message updated as read"})
    } catch (error) {
        console.log(error);
        return res.status(400).send({success: false, Error: error});
    }
}
const messageGet = message.getMessages;
const likesGet = like.getLikes;
const visitsGet = visit.getVisits;
const matchesGet = match.getMatches;
const messageCount = message.checkNumberMessagesRead;
const likesCount = like.checkNumberLikes;
const matchesCount = match.checkNumberMatches;

module.exports = {
    likeCreate,
    visitCreate,
    blockCreate,
    updateRead,
    messageGet,
    likesGet,
    visitsGet,
    matchesGet,
    messageCreate,
    messageCount,
    likesCount,
    matchesCount
}
