var express = require('express'); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.



router.get('/', function(req, res, next) {

  if (req.session.user) {

    var username   = req.session.user.username;
    var full_name  = req.session.user.full_name;
    var email = req.session.user.email;
    var user = true;

    res.render('accessibility', { username: username, full_name: full_name, email : email, user : user }); //ensure that this is the file name and not a file path when rendering new pages

  } else {
    res.render('accessibility'); //ensure that this is the file name and not a file path when rendering new pages

  }




  
  });

  
module.exports = router;
