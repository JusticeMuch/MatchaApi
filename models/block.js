const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Block{
    async createBlock(req, res, object){
        const {blocked_user, blocking_user, date} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Block" (blocked_user, blocking_user, date) VALUES ($1, $2, $3) RETURNING id',
          [blocked_user, blocking_user, date],
        )
        .then(async (data) => {
            if (data.length == 0)
                return await res.status(400).send({success : false, message : `block not created`});
            else
            return await res.status(200).send({success : true, message : `block id : ${data[0].id} created`});
        });       
      } catch (err) {
          console.log('Error in model Block.createBlock()');
        return res.status(400).send({ success: false, error: err.message });
      }
    }

    async getBlock(blocking_user){
        try {
            return await db.any(`SELECT id, date, blocked_user FROM public."Block" WHERE blocking_user = $1`,
            [blocking_user]).then(async (data) => {
                if (data.length == 0)
                    return null
                else
                    return data;
            })
        }catch(err){
            console.log('Error in model Block.getBlock()');
        return Error("Something when wrong in block.getBlock()");
        }
    }

    async checkNumberBlocks(req, res){
        const id = req.user._id;
        try {
            return await db.any(`SELECT COUNT(id) FROM public."Block" WHERE blocking_user = $1`,
                [id]).then(data => {
                    return res.status(200).send({success : true, data : data});
                });
        } catch (error) {
            console.log(error);
            return res.status(400).send({success : false, Error : error});
        }
    }
}

module.exports = {Block}