const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Profile{

    async createProfile(object){
        const {firstname, lastname, username, password, email} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Profile" (firstname, lastname, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [firstname, lastname, username, password, email],
        )
        .then(data => {
          try{
            const token = new Token({ _userId: data[0].id, token: crypto.randomBytes(16).toString('hex') });
            return await token.save(async function(err) {
                if (err) { return res.status(500).send({ message: err.message }); }
                const msg = {
                    from: 'no-reply@matcha.com',
                    to: email,
                    subject: 'Account Verification Token',
                    text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://localhost:5000/api/user/confirmation/${token.token}`
                  };
                  await sgMail.send(msg);
                  return({sucess : true, id : data[0].id});
            });
        }catch(err){
            return ({sucess : false, Error : err.message});
        }
        });
      } catch (err) {
          console.log('Error in model User.create()');
        return { sucess: false, error: err.message };
      }
    }
}

module.exports = {Profile}