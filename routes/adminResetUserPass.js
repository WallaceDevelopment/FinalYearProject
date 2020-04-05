var express = require('express'); // All routes must declare the express variable to require the express framework.
var router = express.Router(); // Similarily, the router variable must be associated with the express router functionality.

/*-----------------------Admin Router Handling------------------------*/

router.get('/', isAuthenticated, function(req, res, next) {

  var username   = req.session.user.username;
  var full_name  = req.session.user.full_name;
  var email = req.session.user.email;
    
  console.log('')
  console.log('*** Accessed adminResetUserPass ***')
  console.log('')
  res.render('adminResetUserPass', { username: username, full_name: full_name, email : email });

});

/*-----------------------isAdmin Handling------------------------*/

function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        req.flash('message', 'User with administrator privileges is not signed in. Please sign in to continue.')
        return res.redirect('/signin');
    }
    if (req.session.user) {
        var isAdmin = req.session.user.userTypeID
        if (isAdmin == 1) {
            return next();
        } else {
            console.log('')
            console.log('*** Account does not have Administrator privileges ***')
            console.log('*** Redirecting to signin... ***')
            console.log('')

            req.flash('message', 'This account does not have administrator privileges.')
            res.redirect('/signin');
        }
    } 
}

module.exports = router;
