

var mysql        = require('mysql'); // mysql module is used as a driver.
require('dotenv').config()

// This block of code contains mysql database connection credentials for selecting data from the database.
var connection   = mysql.createConnection({
  supportBigNumbers: true,
  bigNumberStrings: true,
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DATABASE
});

module.exports = connection;
