const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyOptions = {
    expiresIn:  "12h",
    algorithm:  ["RS256"]
   };

function authenticateToken  (req, res, next) {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send("Access denied!");

    try {
        const verified = jwt.verify(token, process.env.SECRET, verifyOptions);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).send("Invalid Token!");
    }
}

module.exports = authenticateToken;