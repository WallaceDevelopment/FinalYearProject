var express = require("express"); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/*-----------------------Admin Router Handling------------------------*/

router.get("/", isAuthenticated, function(req, res, next) {
  var username = req.session.user.username;
  var full_name = req.session.user.full_name;
  var email = req.session.user.email;
  var isAdmin = req.session.user.userTypeID;

  var user = true;

  res.render("aboutus", {
    username: username,
    full_name: full_name,
    email: email,
    user: user,
    isAdmin: isAdmin
  });
});

/*-----------------------isAdmin Handling------------------------*/

function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.render("aboutus");
  } else {
    var username = req.session.user.username;
    var full_name = req.session.user.full_name;
    var email = req.session.user.email;
  }

  var isAdmin = req.session.user.userTypeID;

  if (isAdmin == 1) {
    return next();
  } else {
    return next();
  }
}

module.exports = router;
