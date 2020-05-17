var express = require("express"); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/* GET home page. redirect user to signin page */

router.get("/", isAuthenticated, function(req, res, next) {
  // res.redirect('/signin');
});

function isAuthenticated(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/signin");
  } else {
    var username = req.session.user.username;
    var full_name = req.session.user.full_name;
    var email = req.session.user.email;

    return res.render("dashboard", {
      username: username,
      full_name: full_name,
      email: email,
      user: user,
      isAdmin: isAdmin
    });
  }
}

module.exports = router;
