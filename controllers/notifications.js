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
const request = require('request');
const {getBy, getFiltered, updateById, checkField} = require('../middleware/generic_methods');
require('dotenv').config();
const like = new Like();
const visit = new Visit();
const block = new Block();

const schemaLike = Joi.object({
    liked_user : Joi.number().required(),
    date : Joi.string().required()
});

const schemaVisit = Joi.object({
    visited : Joi.number().required(),
    date : Joi.string().required()
});

const schemaBlock = Joi.object({
    blocked_user : Joi.number().required(),
    date : Joi.string().required(),
})

const likeCreate = async (req, res) => {
   const {error} =  await schemaLike.validate(req.body);
   if (error) return res.status(400).send({success : false, Error : error.details});

   const {liked_user, date} = req.body;
   const liking_user = req.user._id;

   return await like.createLike(req, res, {liked_user, liking_user, date});
}

const visitCreate = async (req, res) => {
    const {error} =  await schemaLike.validate(req.body);
    if (error) return res.status(400).send({success : false, Error : error.details});

    const {visited , date} = req.body;
    const {visitor} = req.user._id;

    return await visit.createVisit(req, res, {visitor, visited, date});
}

const blockCreate = async (req, res) => {

    const {error} = schemaBlock.validate(req.body);
    if (error) return res.status(400).send({success : false, Error : error.details});

    const {blocked_user, date} = req.body;
    const blocking_user = req.user._id;

    return await block.createBlock(req, res, {blocked_user, blocking_user, date});
}

module.exports = {likeCreate, visitCreate, blockCreate}