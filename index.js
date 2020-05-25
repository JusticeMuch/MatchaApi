const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config()

const app = express();
const authRoute = require('./routes/auth');

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

mongoose
.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("Connected to the database!");
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
})
.catch(err => {
  console.log("Cannot connect to the database!", err);
  process.exit();
});
