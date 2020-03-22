// Set modules as variables
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var { check, validationResult } = require('express-validator');

// Set routes for html pages - new pages need to be added here to link them with their route files
var index = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register'); 
var changepassword = require ('./routes/changepassword');
var accessibility = require ('./routes/accessibility');
var dashboard = require('./routes/dashboard');

// 'app' is used in place of express for readability
var app = express();

// Setup for pug as a view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var flash    = require('connect-flash'); //connect-flash is used for storing messages in a 'session' (when a user is logged in)
var crypto   = require('crypto'); //crypto implements crytographic functionalities, used in this instance for salting passwords

// Login Script. This is provided by Programmerblog.net.
var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy; // Passport-local authenticates with a username and password
var connection     = require('./lib/dbconn'); // dbconn file in lib contains MySQL credentials to AWS RDS database.

 var sess  = require('express-session'); // express-session handles user sessions
 var Store = require('express-session').Store
 var BetterMemoryStore = require(__dirname + '/memory')
 var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true }) // Session handling in memory
 app.use(sess({
    name: 'FinalYearProject-Session', // Session name
    secret: '749ed3c859', // Session secret
    store:  store,
    resave: true,
    saveUninitialized: true
}));

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// sets express to the use the 'flash' module.
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);              // The '/' directory will display the index page
app.use('/users', users);         // The /users directory will display the users page
app.use('/register', register);   // The /register directory will display the register page
app.use('/changepassword', changepassword);
app.use('/accessibility', accessibility);
app.use('/dashboard', dashboard);

// passport strategy -- the express session middleware before calling passport.session()
passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true         //passback entire req to call back
} , function (req, username, password, done){
      console.log("\n *** Username Entered: "+ username + " ***");
      console.log("\n *** Password Entered: "+ password + " *** \n");
      
      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); } // If username + password fields null, then throw err.
      
      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6'; 
      
      connection.query("select * from tbl_users_test where username = ?", [username], function(err, rows){       // Find username entered by the user.
          console.log(err);
        if (err) return done(req.flash('message',err));

        if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); } // Identify if username exists
        
        salt = salt+''+password;      // Concatenate salt and password
        
        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');   // Create sha1 hash
        var dbPassword  = rows[0].password;   // Crawl database to see if password exists
        
        // If the hashed password is not found in the database, then produce message.
        if(!(dbPassword == encPassword)){
          console.log("\n *** Login Unsuccessful *** \n")
            return done(null, false, req.flash('message','Invalid username or password.'));
         }
         console.log("\n *** Login Successful *** \n")
         req.session.user = rows[0]; 
        return done(null, rows[0]);
      });
    }
));

// Serialise user for the session
passport.serializeUser(function(user, done){
    done(null, user.id);
});

// Deserialize user for the session with the user id from the database.
passport.deserializeUser(function(id, done){
    connection.query("select * from tbl_users_test where id = "+ id, function (err, rows){
        done(err, rows[0]);
    });
});

// Navigating to /signin will render the login/index page
app.get('/signin', function(req, res){
  res.render('login/index',{'message' :req.flash('message')});
});

/* Using the local strategy of a username and a hashed password, this block of code will authenticate the user with
   a successful outcome redirecting to /users, where it will produce the visualisation dashboard
   an unsuccessful outcome will redirect the user to the /signin page.
*/
app.post("/signin", passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/signin',
    failureFlash: true
}), function(req, res, info){
    res.render('login/index',{'message' :req.flash('message')});
});

// Register Form POST Handling
// Input from the user is checked here for validation. All Fields are trimmed and 'escaped' for database security.
app.post("/register", [
  check('username', 'Please enter a valid username').not().isEmpty().trim().escape(),
  check('fullname', 'Name must be over five characters long.').not().isEmpty().isLength({min: 5}).trim().escape(),
  check('email', 'Please enter a valid email address.').not().isEmpty().isEmail().normalizeEmail().trim().escape(),
  check('password','Password must have a minimum of 5 characters').not().isEmpty().isLength({min: 5}).trim().escape(),
  check('confirmPassword', 'Passwords do not match').not().isEmpty().custom((value, {req, res}) => {
    if (value !== req.body.password) {
      return false
    } else {
      return value;
    }
  }
  //check('confirmPassword', 'Passwords must match').equals('password')
  )], function(req, res){

    const errors = validationResult(req);
    console.log(req.body);

    if (!errors.isEmpty()) {
      console.log('Validation Errors');
      console.log('');
      console.log(errors)
      console.log('')

      var valErrors = (JSON.stringify(errors)); // JSON is stringified here
      var parsed = JSON.parse(valErrors) // Stringified JSON is parsed here
      var substring = 'match';
      displayPassErr = (parsed.errors[0].msg) // .msg locates the msg attribute in the JSON String.
      console.log(displayPassErr.includes(substring)); // Prints to console to see if the string 'must match' is found in the JSON Response.

      console.log('')
      console.log(parsed.errors[0].msg) // Test parsed JSON String

      console.log(req.body.confirmPassword)
      
      /*

      // Block statement confirmPassword validation check using req.body. Used in previous iteration.

      if (req.body.password !== req.body.confirmPassword) {
        console.log('Passwords do not match IF STATEMENT')
        req.flash('message', 'Passwords must match')
        return res.redirect("/signin");
      }
      */

      if(displayPassErr.includes(substring)) { // Check to see if the stringified JSON response contains the substring 'must match', the 'Passwords must match' error will be extracted this way.
        req.flash('message', displayPassErr) // Display the password error
        return res.redirect("/signin"); // Redirect user to the signin page
      }



      var printout = 'Name and Password must exceed five characters.'
      console.log('')      
      console.log('Stringified JSON printout: ' + valErrors); // Prints out stringified JSON
      console.log('')
      console.log('Errors Found: ' + displayPassErr)
      console.log('')
      req.flash('message', printout)
      return res.redirect("/signin");
    }

  // Read input from post form
  regUsername = req.body.username,
  regPassword = req.body.password,
  regFullName = req.body.fullname,
  regEmail = req.body.email,
  regUserTypeID = '1'

/* 
  var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=6Lc109oUAAAAAB-HVAvXZ5bKnfRwbhm2AbjgyNcQ}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
  var captcha = req.body['g-recaptcha-response'];
  if(!captcha){
  req.flash('message', 'Recaptcha validation failure. Please try again.')
  return res.redirect("/users");
}
*/

  console.log("*** User has submitted the username: "+ regUsername + " ***")  // the console log at this point shows that the form has been parsed correctly with body-parser.
  console.log("*** User has submitted the password: "+ regPassword+ " ***")
  console.log("*** User has submitted the fullname: "+ regFullName + " ***")
  
  var regSalt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6'; //Salt will be kept as environmental variable in the future.
  regSalt = regSalt+''+regPassword;
  var encRegPassword = crypto.createHash('sha1').update(regSalt).digest('hex');
  console.log("*** The Encoded password is: "+encRegPassword + " ***")
  
  // this establishes a connection with the database and inserts the parsed data above into tbl_users with variables.
  
    var sql = "INSERT INTO tbl_users_test (username, password, full_name, email, userTypeID) VALUES ('"+regUsername+"', '"+encRegPassword+"', '"+regFullName+"', '"+regEmail+"', '"+regUserTypeID+"')"
    connection.query(sql, function (err, result) { //values inserted into the query
      if (err) throw err;
      req.flash('message', 'Registration successful!' + '\n' + ' Please login and enter the code found on the e-mail to continue.')
      console.log('')
      console.log("*** Success! | 1 record inserted ***"); // logs a success of the operation in the console.
      console.log('')
      res.writeHead(302,{Location: '/users'}); // redirects the user after successul registration
      res.end()
    })
  });

// Change Password POST Form

app.post("/change-auth-password", function(req, res, done){

newPass = req.body.passwordchange;
var newPassSalt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6'; //ensure that this is in the environment for the future
  newPassSalt = newPassSalt+''+newPass;
  var encNewPass = crypto.createHash('sha1').update(newPassSalt).digest('hex');
  console.log("\n *** The New Encoded password is: "+encNewPass + " ***")

  currUser = req.user.username;

  console.log("\n *** Changing password for user: " + currUser + " *** \r" )

  var newPassSql = "UPDATE tbl_users_test SET password = '"+encNewPass+"' WHERE username = '"+currUser+"'";
  // var newPassSql = "UPDATE tbl_users_test set password = 'random' where username = 'testuser';"

  connection.query(newPassSql, function (err, result) { //values inserted into the query
    if (err) throw err;
    console.log("\n *** Success! Password Changed *** \n"); // logs a success of the operation in the console.
    req.flash('message', 'Password change successful!')
    req.logout();
    res.redirect('/signin');


  })

});

// Same code as the post form 'changepass' but for an unauthenticated user

app.post("/change-unauth-password", function(req, res, done){

  newUser = req.body.newPasswordUsername;
  newPass = req.body.newPassword;

  var unauthPassSalt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6'; //ensure that this is in the environment for the future
    unauthPassSalt = unauthPassSalt+''+newPass;
    var encNewPass = crypto.createHash('sha1').update(unauthPassSalt).digest('hex');
    console.log("\n *** The New Encoded password is: "+encNewPass + " ***")
  
    console.log("\n *** Changing password for user: " + newUser + " *** \r" )
  
    var newPassSql = "UPDATE tbl_users_test SET password = '"+encNewPass+"' WHERE username = '"+newUser+"'";
    // var newPassSql = "UPDATE tbl_users_test set password = 'random' where username = 'testuser';"
  
    connection.query(newPassSql, function (err, result) { //values inserted into the query
      if (err) throw err;
      console.log("\n *** Success! Password Changed *** \n"); // logs a success of the operation in the console.
      req.flash('message', 'Password change successful!')
      res.redirect('/signin');
   
    })
  
  });



// When logging out, this code will 'destroy' the session and redirect the user to the /signin page.
app.get('/logout', function(req, res){
    req.session.destroy();
    req.logout();
    res.redirect('/signin');
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page - will render a 404 error alongside an error stack for this.
  res.status(err.status || 500);
  res.render('error');
});

// Testing Google Recaptcha

 function verifyCaptcha() {
    document.getElementById('g-recaptcha-error').innerHTML = '';
}

module.exports = app;


// REFERENCES

// https://www.w3docs.com/snippets/nodejs/how-to-redirect-a-web-page-with-node-js.html