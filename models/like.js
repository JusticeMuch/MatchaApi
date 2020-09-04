const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const {Profile} = require('../models/profiles');
const {Match} = require('../models/match');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const {createNotification, emitNotification} = require('../socket');
const jwt = require('jsonwebtoken');
const match = new Match();
const profile = new Profile();
const {deleteByValue} = require('../middleware/generic_methods');
const {getBy} = require('../middleware/generic_methods');

class Like {

    async getLike(liking_user, liked_user) {
        try {
            return await db.any(`SELECT id, date FROM public."Like" WHERE liked_user = $1 AND liking_user = $2`, [liked_user, liking_user]).then(async (data) => {
                if (data.length == 0) 
                    return null
                 else 
                    return data;
                
            })
        } catch (err) {
            console.log('Error in model Like.getLike()');
            return Error("Something when wrong in like.getLike()");
        }
    }

    async createLike(req, res, object) {
        const {liked_user, liking_user, date} = object;
        try {
            return await db.any('INSERT INTO public."Like" (liked_user, liking_user, date) VALUES ($1, $2, $3) RETURNING id', [
                liked_user, liking_user, date
            ],).then(async (data) => {
                console.log(data);
                if (!data && data.length == 0) 
                    return await res.status(400).send({success: false, message: `like not created`, like_id: null});
                 else {
                    await profile.updatePopularity(liked_user, 1);
                    const likeback = await this.getLike(liked_user, liking_user);
                    // console.log(likeback);
                    if (likeback && likeback.length > 0) {
                        const mat = (await match.createMatch({user1: liked_user, user2: liking_user, date}));
                        await emitNotification(liked_user, createNotification('match', liked_user, liking_user, null));
                        await emitNotification(liking_user, createNotification('match', liking_user, liked_user, null));

                        await profile.updatePopularity(liked_user, 5);
                        if (mat) 
                            res.status(200).send({success: true, data :{like_id: data[0].id, match_id: mat.id}});
                         else 
                            res.status(400).send({success: false, Error: {message : "Like created , but error in creating match"}});
                        
                    }
                    return await res.status(200).send({success: true, data :{like_id: data[0].id, match_id: null}});
                }
            });
        } catch (err) {
            console.log('Error in model Like.createLike()');
            return res.status(400).send({success: false, error: {message : err.message}});
        }
    }

    async getLikes(req, res) {
        const {date} = req.query;
        const liked_user = req.user._id;

        try {
            if (!date || date == undefined) {
                return db.any(`SELECT * FROM public."Like" WHERE liked_user = $1 ORDER BY date DESC;`, [liked_user]).then(data => {
                    return res.status(200).send({success: true, data: data});
                })
            } else {
                return db.any(`SELECT * FROM public."Like" WHERE liked_user = $1 AND date > $2 ORDER BY date DESC;`, [liked_user, date]).then(data => {
                    return res.status(200).send({success: true, data: data});
                });
            }
        } catch (error) {
            return res.status(400).send({success: false, Error: {message : error.message}});
        }
    }

    async getLiked(req, res){
        const user = req.user._id;
        try {
            return db.any(`SELECT * FROM public."Like" WHERE liking_user = $1 ORDER BY date DESC;`, [user]).then(data => {
                return res.status(200).send({success: true, data: data});
            });
        } catch (error) {
            return res.status(400).send({success: false, Error: {message : error.message}});
        }
    }

    async checkNumberLikes(req, res) {
        const id = req.user._id;
        try {
            return await db.any(`SELECT COUNT(id) FROM public."Like" WHERE liking_user = $1`, [id]).then(data => {
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
                return deleteByValue("Like", "id", id).then(data => {
                    getBy("id", id, "Like").then(data => {
                        emitNotification(data[0]['liked_user'] , createNotification(
                            'unlike', data[0]['liking_user'], data[0]['liked_user'], null));
                    });
                    return res.send({success :true, message : `Like id : ${id} deleted`});
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
    Like
}
