const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');
const {deleteByValue} = require('../middleware/generic_methods');
const { findById } = require('../models/token');

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
            return await db.any(`SELECT id, date FROM public."Match" WHERE (user1 = $1 AND user2 = $2) OR (user1 = $2 AND user2 = $1)`
            , [user1, user2]).then(async (data) => {
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
                return db.any(`SELECT * FROM public."Match" WHERE user1 = $1 OR user2 = $1 ORDER BY date DESC;`, [user]).then(data => {
                    return res.status(200).send({success: true, data: data});
                })
            } else {
                return db.any(`SELECT * FROM public."Match" WHERE user1 = $1 OR user2 = $1 AND date > $2 ORDER BY date DESC;`, [user, date]).then(data => {
                    return res.status(200).send({success: true, data: data});
                });
            }
        } catch (error) {
            return res.status(400).send({success: false, Error: {message : error.message}});
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
            return res.status(400).send({success: false, Error: {message : error.message}});
        }
    }

    async deleteById(req, res){
        const {id} = req.query;

        if (id && id != undefined){
            try {
                return deleteByValue("Match", "id", id).then(async (data) => {
                    await db.any(`DELETE FROM public."Like" WHERE liked_user = $1 AND liking_user = $2`, [data[0].user1, data[0].user2]);
                    await db.any(`DELETE FROM public."Like" WHERE liked_user = $2 AND liking_user = $1`, [data[0].user1, data[0].user2]);
                    await res.send({success :true, message : `Match id : ${id} deleted`});
                });
            } catch (error) {
                res.status(400).send({success : false, Error : {message : error.message}});
            }
        }else{
            res.status(400).send({success: false, Error : {message : "Id field is empty" }})
        }
    }
}

module.exports = {
    Match
}
