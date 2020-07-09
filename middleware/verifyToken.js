const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
    const token = req.header('auth-token');
    if (!token)
        return res.status(401).send("Access denied!");

    try {
        const verified = jwt.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send("Invalid Token!");
    }
}

async function authenticateSocketToken(token) {
    if (!token) {
        console.log('socket token blank');
        return (Error('Token blank'));
    }
    try {
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        }
        return (jwt.verify(token, process.env.SECRET));
    } catch (error) {
        console.log(error);
        return (Error(error));
    }
}

module.exports = {
    authenticateToken,
    authenticateSocketToken
};