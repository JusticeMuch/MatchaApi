const {db, pgp} = require('../db');
const {getFiltered, updateById} = require('../middleware/generic_methods');
const joi = require('@hapi/joi');
const bcrypt = require('bcrypt');

const schema = joi.object({reported_user: joi.number().required(), reason: joi.string().required(), date: joi.string().required()})

class Report {
    async createReport(req, res) {

        const {error} = schema.validate(req.body);
        if (error) 
            return res.status(400).send({success: false, Error: error.details});
        


        const reporting_user = req.user._id;
        const {reported_user, reason, date} = req.body;

        return await db.any('INSERT INTO public."Report" (reporting_user, reported_user, reason, date) VALUES ($1, $2, $3, $4) RETURNING id', [reporting_user, reported_user, reason, date]).then(data => {
            return res.send({success: true, report_id: data[0].id})
        }).catch(err => {
            console.error(err);
            return res.status(400).send({success: false, Error: {message : err.message}});
        })
    }

    async suspendUser(req, res) {
        const {username, password, userId} = req.body;
        if (!username || !password || !userId) 
            return res.status(400).send({success: false, Error: {message : "Fields are blank"}});
        


        return await getFiltered("Admin", "username", username, "password, id").then(async (data) => {
            const valid = await bcrypt.compare(password, data[0].password);

            if (data.length == 0) 
                return res.status(400).send({success: false, Error: {message : "No such admin is on system"}});
             else if (! valid) 
                return res.status(400).send({success: false, Error: {message : "Invalid password"}});
             else {
                return await updateById("Profile", userId, {suspended: true}).then(data => {
                    res.send({success: true, message: "user has been suspended"});
                })
            }
        }).catch(error => res.status(400).send({sucess: false, Error: {message : error.message}}));
    }
}

module.exports = {
    Report
};
