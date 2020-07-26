const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('./token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Message {
    async createMessage(req, res, object) {
        const {match_id, author, content, date} = object;
        try {
            return await db.any('INSERT INTO public."Message" (match_id, author, content, date) VALUES ($1, $2, $3, $4) RETURNING id', [
                match_id, author, content, date
            ],).then(async (data) => {
                if (data.length == 0) 
                    return await res.status(400).send({success: false, Error :{message: `message not created`}});
                 else 
                    return await res.status(200).send({success: true, message: `message id : ${
                            data[0].id
                        } created`});
                
            });
        } catch (err) {
            console.log('Error in model Message.createMessage()');
            return res.status(400).send({success: false, error: {message : err.message}});
        }
    }

    async getMessagesById(match_id) {
        try {
            return await db.any(`SELECT author, content, date FROM public."Message" WHERE match_id = $1`, [match_id]).then(async (data) => {
                if (data.length == 0) 
                    return null
                 else 
                    return data;
                
            })
        } catch (err) {
            console.log('Error in model Message.getMessages()');
            return Error("Something when wrong in Message.getMessages");
        }
    }

    async updateRead(message_id) {
        try {
            return await db.any(`UPDATE public."Message" SET read = true WHERE id = ${message_id}`).then(data => {
                return data;
            })
        } catch (err) {
            console.log("Error in Message.updateRead()");
            return Error("Something went wrong in Message.updateRead()");
        }
    }

    async checkNumberMessagesRead(req, res) {
        const {match_id} = req.query;
        try {
            return await db.any(`SELECT COUNT(match_id) FROM public."Message" WHERE match_id = $1 AND read = $2`, [match_id, false]).then(data => {
                return res.status(200).send({success: true, data: data});
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({success: false, Error: {message : error.message}});
        }
    }

    async getMessages(req, res) {
        const {date} = req.query;
        const user = req.user._id;

        try {
            if (!date || date == undefined) {
                return db.any(`SELECT * FROM public."Message" WHERE match_id = (SELECT match_id FROM public."Match" WHERE user1 
                    = ${user} OR user2 = ${user});`, [user]).then(data => {
                    return res.status(200).send({success: true, data: data});
                })
            } else {
                return db.any(`SELECT * FROM public."Message" WHERE match_id = (SELECT match_id FROM public."Match" WHERE user1 
                        = ${user} OR user2 = ${user}) AND date > $2;`, [liked_user, date]).then(data => {
                    return res.status(200).send({success: true, data: data});
                });
            }
        } catch (error) {
            return res.status(400).send({success: false, Error: {message : error.message}});
        }
    }
}

module.exports = {
    Message
}
