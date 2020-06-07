const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const authToken = require('./middleware/verifyToken')
require('dotenv').config()
const Pool = require('pg').Pool
const profileRoute = require('./routes/profile');
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
app.use('/api/profile' ,profileRoute);
// app.use('/api/profile', authToken, profileRoute); route with authentication


app.get("/", (req, res) => {
  res.json({ message: "Welcome to Matcha API" });
});

const createUsersString = "create table if not exists users"
                          +"(id serial primary key,"  
                          +"username text not null unique," 
                           +"email text not null unique,"  
                           +"password text not null," 
                           +"authenticated bool default 'f')";

const createProfileString =  ""
                              // +"create type sex_pref as enum('straight', 'lesbian', 'gay', 'bi-sexual');"
                              +" create table if not exists profiles" 
                              +" (id serial primary key references users(id) on delete cascade on update cascade,"
                              +" first_name text not null," 
                              +" last_name text not null," 
                              +" username text not null references users (username) on delete cascade on update cascade,"
                              +" fame integer default 0, "
                              +" sexual_preferance sex_pref default 'bi-sexual',"
                              +" email text not null references users (email) on delete cascade on update cascade," 
                              +" age integer not null," 
                              +" bio text not null,"  
                              +" images text [], "
                              +" tags text [] not null, latitude integer ,"
                              +" longitude integer, address text not null );";

mongoose
.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  await pool.query(createUsersString).then((results, error) => {
    if (error) console.log(error);
    else console.log("Users table created");
  });
  await pool.query(createProfileString).then((results, error) => {
    if (error) console.log(error);
    else console.log("Profiles table created");c
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