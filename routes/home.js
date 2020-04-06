var express = require('express'); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/* GET user information after login */

router.get('/', isAuthenticated, function(req, res, next) {

  var username   = req.session.user.username;
  var full_name  = req.session.user.full_name;
  var email = req.session.user.email;
    
  res.render('home', { username: username, full_name: full_name, email : email });

});

// access to this page is restricted unless a user is authenticated through passport.
function isAuthenticated(req, res, next) {
  if (req.session.user)
      return next();

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SIGNIN PAGE
  res.redirect('/signin');
}




module.exports = router;