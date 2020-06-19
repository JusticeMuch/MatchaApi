const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('./token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Message{
    async createMessage(req, res, object){
        const {match_id, author, content, creationDate} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Message" (match_id, author, content, creationDate) VALUES ($1, $2, $3, $4) RETURNING id',
          [match_id, author, content, creationDate],
        )
        .then(async (data) => {
            if (data.length == 0)
                return await res.status(400).send({success : false, message : `message not created`});
            else
            return await res.status(200).send({success : true, message : `message id : ${data[0].id} created`});
        });       
      } catch (err) {
          console.log('Error in model Message.createMessage()');
        return res.status(400).send({ success: false, error: err.message });
      }
    }

    async getMessages(match_id){
        try {
            return await db.any(`SELECT author, content, date FROM public."Message" WHERE match_id = $1`,
            [match_id]).then(async (data) => {
                if (data.length == 0)
                    return null
                else
                    return data;
            })
        }catch(err){
            console.log('Error in model Message.getMessages()');
        return Error("Something when wrong in Message.getMessages");
        }
    }
}

module.exports = {Message}