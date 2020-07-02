const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('./token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Report{
    async createReport(data){
        const{reporting_user, reported_user, reason, date} = data;

        return await db.any(
          'INSERT INTO public."Report" (reporting_user, reported_user, reason, date) VALUES ($1, $2, $3, $4) RETURNING id',
          [reported_user, reported_user, reason, date]).then(data => {return data}).catch(err => {
              console.error(err); return Error(err);
          })
    }

    async suspendUser(userId){ //must add admin 

    }
}