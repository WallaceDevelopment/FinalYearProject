var express = require('express'); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/* GET user information after login */

router.get('/', function(req, res, next) {


    
  res.redirect('/dashboard');

});




module.exports = router;