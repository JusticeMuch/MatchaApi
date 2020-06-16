// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const authToken = require('./middleware/verifyToken')
// require('dotenv').config()
// const Pool = require('pg').Pool
// const profileRoute = require('./routes/profile');
// const app = express();
// const authRoute = require('./routes/auth');

// const PORT = process.env.PORT || 8080;
// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.use('/api/user', authRoute);
// app.use('/api/profile' ,profileRoute);
// // app.use('/api/profile', authToken, profileRoute); route with authentication


// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to Matcha API" });
// });


// mongoose
// .connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(async () => {
//   await pool.query(createUsersString).then((results, error) => {
//     if (error) console.log(error);
//     else console.log("Users table created");
//   });
//   await pool.query(createProfileString).then((results, error) => {
//     if (error) console.log(error);
//     else console.log("Profiles table created");
//   });
//   await console.log("Connected to the database!");
//   await app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
//   });
// })
// .catch(err => {
//   console.log("Cannot connect to the database!", err);
//   process.exit();
// });

// module.exports = {pool}