
require('dotenv').config();

const express = require('express');
const db = require('./mongoose');
const cors = require('cors');
const passport = require("passport");
const path = require("path");
let PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

db.connect();
app.use(passport.initialize());
require("./middlewares/jwt")(passport);

require('./routes/index')(app);

app.listen(PORT, () => console.log('Server running on http://localhost:'+PORT+'/'));