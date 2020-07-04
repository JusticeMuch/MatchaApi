const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Visit{
    async createVisit(req, res, object){
        const {visited, visitor, date} = object;
      try{
        return await db
        .any(
          'INSERT INTO public."Visit" (visited, visitor, date) VALUES ($1, $2, $3) RETURNING id',
          [visited, visitor, date],
        )
        .then(async (data) => {
            if (data.length == 0)
                return await res.status(400).send({success : false, message : `visit not created`});
            else
            return await res.status(200).send({success : true, message : `visit id : ${data[0].id} created`});
        });       
      } catch (err) {
          console.log('Error in model Visit.createVisit()');
        return res.status(400).send({ success: false, error: err.message });
      }
    }

    async getVisit(visitor, visited){
        try {
            return await db.any(`SELECT id, date FROM public."Visit" WHERE visited = $1 AND visitor = $2`,
            [visited, visitor]).then(async (data) => {
                if (data.length == 0)
                    return null
                else
                    return data;
            })
        }catch(err){
            console.log('Error in model Visit.getVisit()');
        return Error("Something when wrong in Visit.getVisit()");
        }
    }

    async getVisitCount(visited){
        try {
            db.any(`SELECT COUNT(id) FROM public."Visit" WHERE visited = $1`, [visited]).then(data => {
                return data;
            })
        } catch (error) {
            console.log(error);
            return Error(error);
        }
    }
}

module.exports = {Visit}