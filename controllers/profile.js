const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.PG_USERNAME,
    host: 'localhost',
    database: 'matcha',
    password: process.env.PG_PASSWORD,
    port: 5432
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  

// const imagesToLinks = (req, res) => {
//     const(username, imageArray) = req.body;
//     const params = {
//         Bucket: bucket,
//         Key: fileName,
//         Body: JSON.stringify(data, null, 2)
//     };
//     await s3.upload(params, function(s3Err, data) {
//         if (s3Err) {
//             console.log(s3Err);
//         }
//         console.log(`File uploaded successfully at ${data.Location}`);
//         fileLocations.push(data.Location);
//     });
// }

const createProfile = (data) => {
  const {id, first_name, last_name, username,sexual_preference, email, age, bio, tags, latitude, longitude, address} = data;
  return await pool.query("INSERT INTO profiles (id, first_name, last_name, username,sexual_preference, email, age, \
    bio, tags, latitude, longitude, address) VALUES ($1, $2, $3, $4 , $5, $6 , $7, $8 , $9, $10, $11) returtning *", 
    [id, first_name, last_name, username,sexual_preference, email, age, bio, tags, latitude, longitude, address], 
          async (error, results) => {
            if (error) {
                console.log(error.message);
                return error;
            }else{
                console.log(results.rows[0]);
                return results.rows[0];
            }
        });
}