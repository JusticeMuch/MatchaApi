const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Profile{
  profileKeys = ["firstname", "lastname", "email", "gender", "description", "interests", "location", "last_visit", "popularity", "birthdate"]
    async createProfile(req, res, object){
        const {firstname, lastname, username, password, email} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Profile" (firstname, lastname, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [firstname, lastname, username, password, email],
        )
        .then(async (data) => {
          try{
            const token = new Token({ _userId: data[0].id, token: crypto.randomBytes(16).toString('hex') });
            return await token.save(async function(err) {
                if (err) { return res.status(400).send({success : false, Error: err.message }); }
                const msg = {
                    from: 'no-reply@matcha.com',
                    to: email,
                    subject: 'Account Verification Token',
                    text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://localhost:5000/api/user/confirmation/${token.token}`
                  };
                  await sgMail.send(msg);
                  return res.send({success : true, id : data[0].id});
            });
        }catch(err){
            return res.send({success : false, Error : err.message});
        }
        });
      } catch (err) {
          console.log('Error in model User.create()');
        return res.status(400).send({ success: false, error: err.message });
      }
    }
}

module.exports = {Profile}