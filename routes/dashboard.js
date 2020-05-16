var express = require("express"); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/* GET user information after login */

router.get("/", isAuthenticated, function(req, res, next) {
  var username = req.session.user.username;
  var full_name = req.session.user.full_name;
  var email = req.session.user.email;

  var user = true;

  res.render("dashboard", {
    username: username,
    full_name: full_name,
    email: email,
    user: user
  });
});

// access to this page is restricted unless a user is authenticated through passport.
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();

  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SIGNIN PAGE
  res.redirect("/signin");
}

module.exports = router;

//

var express = require("express"); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/*-----------------------Admin Router Handling------------------------*/

router.get("/", isAuthenticated, function(req, res, next) {
  var username = req.session.user.username;
  var full_name = req.session.user.full_name;
  var email = req.session.user.email;
  var isAdmin = req.session.user.userTypeID;

  var user = true;

  res.render("dashboard", {
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
    req.flash(
      "message",
      "Please sign in to continue."
    );
    return res.redirect("/signin");
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
