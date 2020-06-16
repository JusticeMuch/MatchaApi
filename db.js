const pgp = require('pg-promise')({});
require('dotenv').config();
const QueryFile = pgp.QueryFile;

console.log(process.env.PG_USERNAME);
const settings = {
  host: '127.0.0.1',
  port: 5432,
  database: 'public',
  user: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  currentSchema: 'public',
};

const db = pgp(settings);

// db.any(new QueryFile('matcha.pgsql'));

module.exports = {db, pgp}