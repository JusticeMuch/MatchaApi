const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Match {
    async createMatch(object) {
        const {user1, user2, date} = object;
        try {
            return await db.any('INSERT INTO public."Match" (user1, user2, date) VALUES ($1, $2, $3) RETURNING id', [
                user1, user2, date
            ],).then(async (data) => {
                if (data.length == 0) 
                    return Error("Insertion into match table failed");
                 else 
                    return data[0];
                
            });
        } catch (err) {
            console.log('Error in model Match.createMatch()');
            return Error(err);
        }
    }

    async getMatch(user1, user2) {
        try {
            return await db.any(`SELECT id, date FROM public."Match" WHERE user1 = $1 AND user2 = $2`, [user1, user2]).then(async (data) => {
                if (data.length == 0) 
                    return null
                 else 
                    return data;
                
            })
        } catch (err) {
            console.log('Error in model Match.getMatch()');
            return Error("Something when wrong in match.getMatch()");
        }
    }

    async getMatches(req, res) {
        const {date} = req.query;
        const user = req.user._id;

        try {
            if (!date || date == undefined) {
                return db.any(`SELECT * FROM public."Match" WHERE user1 = $1 OR user2 = $1`, [user]).then(data => {
                    return res.status(200).send({success: true, data: data});
                })
            } else {
                return db.any(`SELECT * FROM public."Match" WHERE user1 = $1 OR user2 = $1 AND date > $2`, [user, date]).then(data => {
                    return res.status(200).send({success: true, data: data});
                });
            }
        } catch (error) {
            return res.status(400).send({success: false, Error: error});
        }
    }

    async checkNumberMatches(req, res) {
        const id = req.user._id;
        try {
            return await db.any(`SELECT COUNT(id) FROM public."Match" WHERE user1 = $1 OR user2 = $1`, [id]).then(data => {
                return res.status(200).send({success: true, data: data});
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({success: false, Error: error});
        }
    }
}

module.exports = {
    Match
}
