

var mysql        = require('mysql'); // mysql module is used as a driver.

// This block of code contains mysql database connection credentials for selecting data from the database.
var connection   = mysql.createConnection({
  supportBigNumbers: true,
  bigNumberStrings: true,
  host     : "awslw7966u.cqmnegv6fbuy.eu-west-2.rds.amazonaws.com",
  user     : "admin",
  password : "B564b663177",
  database : "db_users"
});

module.exports = connection;
