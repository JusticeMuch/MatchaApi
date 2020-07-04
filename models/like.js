const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Like{
    async createLike(req, res, object){
        const {liked_user, liking_user, date} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Like" (liked_user, liking_user, date) VALUES ($1, $2, $3) RETURNING id',
          [liked_user, liking_user, date],
        )
        .then(async (data) => {
            if (data.length == 0)
                return await res.status(400).send({success : false, message : `like not created`});
            else
            return await res.status(200).send({success : true, message : `like id : ${data[0].id} created`});
        });       
      } catch (err) {
          console.log('Error in model Like.createLike()');
        return res.status(400).send({ success: false, error: err.message });
      }
    }

    async getLike(liking_user, liked_user){
        try {
            return await db.any(`SELECT id, date FROM public."Like" WHERE liked_user = $1 AND liking_user = $2`,
            [liked_user, liking_user]).then(async (data) => {
                if (data.length == 0)
                    return null
                else
                    return data;
            })
        }catch(err){
            console.log('Error in model Like.getLike()');
        return Error("Something when wrong in like.getLike()");
        }
    }
}

module.exports = {Like}