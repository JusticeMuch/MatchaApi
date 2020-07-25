const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');
const {updateById} = require('../middleware/generic_methods');

class Profile {
    profileKeys = [
        "firstname",
        "lastname",
        "username",
        "email",
        "gender",
        "description",
        "interests",
        "last_visit",
        "popularity",
        "birthdate",
        "sexual_orientation",
        "sexual_preference"
    ]

    async createProfile(req, res, object) {
        const {
            firstname,
            lastname,
            username,
            password,
            email
        } = object;
        try {
            return await db.any('INSERT INTO public."Profile" (firstname, lastname, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING id', [
                firstname,
                lastname,
                username,
                password,
                email
            ],).then(async (data) => {
                try {
                    const token = new Token({_userId: data[0].id, token: crypto.randomBytes(16).toString('hex')});
                    return await token.save(async function (err) {
                        if (err) {
                            return res.status(400).send({success: false, Error: err.message});
                        }
                        const msg = {
                            from: 'no-reply@matcha.com',
                            to: email,
                            subject: 'Account Verification Token',
                            text: `Hello,\n\n Please verify your account by clicking the link: \nhttp://localhost:5000/api/auth/confirmation/${
                                token.token
                            }`
                        };
                        await sgMail.send(msg);
                        return res.send({success: true, id: data[0].id});
                    });
                } catch (err) {
                    return res.send({success: false, Error: err});
                }
            });
        } catch (err) {
            console.log('Error in model User.create()');
            return res.status(400).send({success: false, error: err});
        }
    }

    async updatePopularity(id, popularity) {
        return await db.any(`UPDATE public."Profile" SET popularity = popularity + '${popularity}' WHERE id = $1`, [id]).then(data => {
            return data;
        }).catch(err => {
            console.log(err);
            return Error(err);
        })
    }

    async getAllProfiles(req, res) {
        try {
            db.any(`SELECT * FROM "Profile"`).then(async data => {
                await data.forEach(e => delete e.password);
                return await res.send({success: true, data: data});
            });
        } catch (error) {
            return res.status(400).send({success: false, Error: error});
        }
    }
}

module.exports = {
    Profile
}
