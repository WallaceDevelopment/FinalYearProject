var express = require('express'); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.



router.get('/', function(req, res, next) {

    res.render('accessibility'); //ensure that this is the file name and not a file path when rendering new pages
  
  });

  
module.exports = router;
