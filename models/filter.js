const {db, pgp} = require('../db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

class Filter {

    filter = {
        sexual_preference : both, //male , female, both
        age : {min : null, max : null},
        interests : [],
        popularity : {min : null, max : null},
        radius : null
    }

    checkFilter(filter){
        
    }

    filterInterests(interests, data){
        let result = [];
        data.forEach(elem => {
            if (interests.every(el => elem.interests.includes(el)))
                 result.push(elem);
        });
    }

    filterLocation(radius, data, userLoc){
        let result = [];
        data.forEach(elem => {
            if (Math.sqrt(Math.pow(elem.location[0] - userLoc[0], 2) + Math.pow(elem.location[1] - userLoc[1], 2)) <= radius)
                result.push(elem);
        })
        return result;
    }

    buildFilterString(filter){
    }
}