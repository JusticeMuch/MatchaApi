const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Token = require('../models/token');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const jwt = require('jsonwebtoken');

const Pool = require('pg').Pool
const pool = new Pool({
    user: process.env.PG_USERNAME,
    host: 'localhost',
    database: 'matcha',
    password: process.env.PG_PASSWORD,
    port: 5432
});