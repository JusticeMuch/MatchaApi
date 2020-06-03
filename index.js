const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authToken = require('./middleware/verifyToken')
require('dotenv').config()
const Pool = require('pg').Pool

const app = express();
const authRoute = require('./routes/auth');

const pool = new Pool({
  user: process.env.PG_USERNAME,
  host: 'localhost',
  database: 'matcha',
  password: process.env.PG_PASSWORD,
  port: 5432,
})

const PORT = process.env.PORT || 8080;
var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/user', authRoute);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Matcha API" });
});
const createUsersString = "create table if not exists users ( \id serial primary key, username text not null unique, email text not null unique, password text not null, authenticated bool default 'f');";


mongoose
.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  await pool.query(createUsersString).then((error, results) => {
    if (error) console.log(error);
    else console.log("Users table created");
  });
  await console.log("Connected to the database!");
  await app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
})
.catch(err => {
  console.log("Cannot connect to the database!", err);
  process.exit();
});

module.exports = {pool}