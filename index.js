const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Token = require('./models/token');
const {authenticateToken, validateToken} = require('./middleware/verifyToken')
require('dotenv').config()
const Pool = require('pg').Pool
const profileRoute = require('./routes/profile');
const notificationRoute = require('./routes/notifications');
const app = express();
const socketio = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const io = socketio(server);
const authRoute = require('./routes/auth');
const {db, pgp} = require('./db');
const fs = require('fs');
const insertUserProfiles = require('./init');
const QueryFile = pgp.QueryFile;

global.io = io;

const interests = JSON.parse(fs.readFileSync('interests.json'));

const PORT = process.env.PORT || 8080;
const corsOptions = {
};
require('./socket').socketConnect();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/api/auth', authRoute);

app.get('/api/interests' , (req, res) =>{
    res.send({data : interests});
});

app.use('/api/profile', authenticateToken, profileRoute);
app.use('/api', authenticateToken, notificationRoute);
app.post('/api/token', validateToken);



app.get("/", (req, res) => {
    res.json({message: "Welcome to Matcha API"});
});


mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    await db.any(new QueryFile('matcha.pgsql'));
    Token.collection.drop();
    await insertUserProfiles();

    await server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}).catch(err => {
    console.log("Cannot connect to the database!", err);
    process.exit();
});
