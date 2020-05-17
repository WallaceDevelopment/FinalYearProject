// Set modules as variables
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var { check, validationResult } = require('express-validator');
var nodemailer = require('nodemailer');
require('dotenv').config()

// Set routes for html pages - new pages need to be added here to link them with their route files
var index = require('./routes/index');
var home = require('./routes/home');
var users = require('./routes/users');
var register = require('./routes/register');
var changepassword = require('./routes/changepassword');
var accessibility = require('./routes/accessibility');
var dashboard = require('./routes/dashboard');
var verify = require('./routes/verify');
var contactus = require('./routes/contactus');
var aboutus = require('./routes/aboutus');

var admin = require('./routes/admin');
var adminResetUserPass = require('./routes/adminResetUserPass');
var adminChangeUsername = require('./routes/adminChangeUsername');
var adminDeleteUser = require('./routes/adminDeleteUser');
//var adminChangeFullname = require('./routes/adminChangeFullname');

// 'app' is used in place of express for readability
var app = express();

// Setup for pug as a view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var flash = require('connect-flash'); //connect-flash is used for storing messages in a 'session' (when a user is logged in)
var crypto = require('crypto'); //crypto implements crytographic functionalities, used in this instance for salting passwords

// Login Script. This is provided by Programmerblog.net.
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; // Passport-local authenticates with a username and password
var connection = require('./lib/dbconn'); // dbconn file in lib contains MySQL credentials to AWS RDS database.

var sess = require('express-session'); // express-session handles user sessions
var Store = require('express-session').Store
var BetterMemoryStore = require(__dirname + '/memory')
var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true }) // Session handling in memory
app.use(sess({
  name: 'fyp000938568-session', // Session name
  secret: '749ed3c859', // Session secret
  store: store,
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

app.use(function(req, res, next){
  res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
  next();
});

app.use('/users', users);         
app.use('/home', home);
app.use('/register', register);   
app.use('/changepassword', changepassword);
app.use('/accessibility', accessibility);
app.use('/dashboard', dashboard);
app.use('/contactus', contactus);
app.use('/aboutus', aboutus);

app.use('/admin', admin);
app.use('/adminResetUserPass', adminResetUserPass);
app.use('/adminChangeUsername', adminChangeUsername);
app.use('/adminDeleteUser', adminDeleteUser);

//app.use('/adminChangeFullname', adminChangeFullname);
//app.use('/verify', verify)

/*-----------------------SET SMTP TRANSPORT------------------------*/

var smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  //secure: true,
  auth: {
    user: "leepjwallace@gmail.com",
    pass: "B564b663177"
  }
});

var rand, mailOptions, host, link;

/*--------------------------LOGIN SYSTEM--------------------------*/




// passport strategy -- the express session middleware before calling passport.session()
passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true         //passback entire req to call back
}, function (req, username, password, done) {
  console.log("\n *** Username Entered: " + username + " ***");
  console.log("\n *** Password Entered: " + password + " *** \n");

  if (!username || !password) { return done(null, false, req.flash('message', 'All fields are required.')); } // If username + password fields null, then throw err.

  var salt = process.env.SALT;

  connection.query("select * from tbl_users_test where username = ?", [username], function (err, rows) {       // Find username entered by the user.
    console.log(err);
    if (err) return done(req.flash('message', 'Database Error'));

    if (!rows.length) { return done(null, false, req.flash('message', 'Invalid username or password.')); } // Identify if username exists

    salt = salt + '' + password;      // Concatenate salt and password

    var encPassword = crypto.createHash('sha1').update(salt).digest('hex');   // Create SHA1 hash
    var dbPassword = rows[0].password;   // Crawl database to see if password exists
    var dbIsVerified = rows[0].isVerified; // 

    // Checks users hashed form password against the hashed password in the database.
    if (!(dbPassword == encPassword)) {
      console.log("\n *** Login Unsuccessful *** \n")
      return done(null, false, req.flash('message', 'Invalid username or password.'));
    }

    // Checks if the 'isVerified' Attribute is set to true.
    if (dbIsVerified == '0') {
      console.log("\n *** User has not verified their account *** \n")
      return done(null, false, req.flash('message', 'Account has not been verified'));
    }

    console.log("\n *** Login Successful *** \n")
    req.session.user = rows[0];
 
    return done(null, rows[0]);
  });
}
));

// Serialise user for the session
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

// Deserialize user for the session with the user id from the database.
passport.deserializeUser(function (id, done) {
  connection.query("select * from tbl_users_test where id = " + id, function (err, rows) {
    done(err, rows[0]);
  });
});

// Navigating to /signin will render the login/index page
app.get('/', function (req, res) {

  if (req.session.user) {
    return res.redirect("/dashboard");
  } else {
    res.render('landing', { 'message': req.flash('message') });


  }
});

app.get('/signin', function(req, res) {
  res.render('login/index', { 'message': req.flash('message')})
});

/* Using the local strategy of a username and a hashed password, this block of code will authenticate the user with
   a successful outcome redirecting to /home, where it will show the home page.
   an unsuccessful outcome will redirect the user to the /signin page.
*/
app.post("/signin", passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/signin',
  failureFlash: true
}), function (req, res, info) {
  res.render('login/index', { 'message': req.flash('message') });
});




// Register Form POST Handling
// Input from the user is checked here for validation. All Fields are trimmed and 'escaped' for database security.
app.post("/register", [
  check('username', 'Please enter a valid username').not().isEmpty().trim().custom(async username => {
    const value = await isUsernameInUse(username);
    if (value != 0) {
        req.flash('message', 'Username count is ' + value)
    } 
  }),
  check('fullname', 'Name must be over five characters long.').not().isEmpty().isLength({ min: 5 }).trim().escape(),
  check('email', 'Please enter a valid email address.').not().isEmpty().isEmail().normalizeEmail().trim().escape().custom(async email => {
    const evalue = await isEmailInUse(email)
    if (evalue != 0) {
      done();
    }
  }),
  check('password', 'Password must have a minimum of 5 characters').not().isEmpty().isLength({ min: 5 }).trim().escape(),
  check('confirmPassword', 'Passwords do not match').not().isEmpty().custom((value, {req}) => {
    if (value !== req.body.password) {
      return false;
    } else {
      return value;
    }
  }
  )], function (req, res) {




    // Read input from post form
    regUsername = req.body.username,
    regPassword = req.body.password,
    regFullName = req.body.fullname,
    regEmail = req.body.email,
    regUserTypeID = '0',
    regIsVerified = '0'
    regVerificationToken = ''

    // Username is appended with the "ValidationToken" String for a hashed token. Good as it uses a unique value everytime.
    hashedUsernameSalt = "ValidationToken" + '' + regUsername  
    var regVerificationToken = crypto.createHash('sha1').update(hashedUsernameSalt).digest('hex'); 
    console.log("Verification Token for" + regUsername + "is:" + regVerificationToken);

    const errors = validationResult(req);
    console.log(req.body);

    if (!errors.isEmpty()) {
      console.log('Validation Errors');
      console.log('');
      console.log(errors)
      console.log('')

      var valErrors = (JSON.stringify(errors)); // JSON is stringified here
      var parsed = JSON.parse(valErrors) // Stringified JSON is parsed here

      displayPassErr = (parsed.errors[0].msg) // .msg locates the msg attribute in the JSON String.
      console.log(displayPassErr.includes(substring)); // Prints to console to see if the string 'must match' is found in the JSON Response.
      console.log('')
      console.log(parsed.errors[0].msg) // Test parsed JSON String
      console.log(req.body.confirmPassword)

      // Check to see if the stringified JSON response contains the substring variable 'subString'.
      var substring = 'match';
      if (displayPassErr.includes(substring)) { 
        req.flash('message', displayPassErr) 
        return res.redirect("/signin"); 
      }

      // Check if the stringified JSON response contains the substring variable 'usrSubString'.
      var usrSubString = 'req';
      if (displayPassErr.includes(usrSubString)) {

        req.flash('message', '* Username Already Exists. Please choose another. *')
        return res.render('register', { message: req.flash('message') });

      }

      var emailSubString = 'done';
      if (displayPassErr.includes(emailSubString)) {
        req.flash('message', 'Email Address is already in use')
        return res.redirect("/signin");
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

    /* 
      var verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=6Lc109oUAAAAAB-HVAvXZ5bKnfRwbhm2AbjgyNcQ}&response=${captcha}&remoteip=${req.connection.remoteAddress}`;
      var captcha = req.body['g-recaptcha-response'];
      if(!captcha){
      req.flash('message', 'Recaptcha validation failure. Please try again.')
      return res.redirect("/users");
    }
    */

    console.log("*** User has submitted the username: " + regUsername + " ***")  // the console log at this point shows that the form has been parsed correctly with body-parser.
    console.log("*** User has submitted the password: " + regPassword + " ***")
    console.log("*** User has submitted the fullname: " + regFullName + " ***")

    var regSalt = process.env.SALT; //Salt will be kept as environment variable in the future.
    regSalt = regSalt + '' + regPassword;
    var encRegPassword = crypto.createHash('sha1').update(regSalt).digest('hex');
    console.log("*** The Encoded password is: " + encRegPassword + " ***")

    // this establishes a connection with the database and inserts the parsed data above into tbl_users with variables.

    var sql = "INSERT INTO tbl_users_test (username, password, full_name, email, userTypeID, isVerified, verificationToken) VALUES ('" + regUsername + "', '" + encRegPassword + "', '" + regFullName + "', '" + regEmail + "', '" + regUserTypeID + "', '" + regIsVerified + "', '" + regVerificationToken + "')"
    connection.query(sql, function (err, result) { //values inserted into the query
      if (err) throw err;
      // req.flash('message', 'Registration successful!' + '\n' + ' Please login and enter the code found on the e-mail to continue.')
      console.log('')
      console.log("*** Success! | 1 record inserted ***"); // logs a success of the operation in the console.
      console.log('')
    })

    //var rand, mailOptions, host, link;

    //rand = Math.floor((Math.random() * 100) + 54);
    //console.log("Random verification number: " + rand);
    host = req.get('host');
    link = "http://"+req.get('host')+"/verify?id="+regVerificationToken;
    contactUsLink = "http://"+req.get('host')+"/contactus";
    ErrEmailLink = "http://"+req.get('host')+"/verifydelete?id="+regVerificationToken;

    mailOptions = {
      from: '"Dashboard Application" <leepjwallace@gmail.com>',
      to: regEmail,
      subject: "Please verify your Dashboard Application Account",
      html: "<center>Hello "+ regFullName +",<br><br> Please use the link below to verify your account.<br><br>Account Username: " + regUsername + "<br><br>Account Email: " + regEmail + "<br><br><a href=" + link + ">Click here to verify</a><br><br><br><br>If you have received this email in error, please <a href=" + ErrEmailLink + ">click here</a> so we can remove your email from our records.<br><br><a href=" + contactUsLink + "> Contact Us</a></center>"
    }
    // console.log("These are the mailOptions " + mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log("smtpTransport ERROR: " + error);
        req.flash('message', 'smtpTransport ERROR.')
        return res.redirect("/signin");
      } else {
        console.log("Message sent: " + response.message);

        req.flash('success', 'Registration Successful! Please check your email to verify your account.')
        return res.render('register', { success: req.flash('success') });

      }
      
    });

  app.get('/random', function (req, res) {
    console.log(req.protocol + ":/" + req.get('host'));
    if ((req.protocol + "://" + req.get('host')) == ("http://" + host)) {
      console.log("Domain is matched. Information is from Authentic email");
      if (req.query.id == rand) {
        console.log("email is verified");
        res.end("")
      }
      else {
        console.log("email is not verified");
        res.end("");
      }
    }
  })
});

/*-----------------------/VERIFY LINK------------------------*/

// This function is used to check the '?id=' query against the /verify link.
// Verifies a user through their registration link recieved on an email.

app.get('/verify', function(req,res) {
  var queryParameter = req.query.id;
  //res.json(queryParameter);
  console.log("/Verify Callback Query = " + req.query)
  console.log('')
  console.log("/Verify Callback Query ID = " + req.query.id)
  
  
  connection.query("SELECT * FROM tbl_users_test WHERE verificationToken = ?", [queryParameter], function (err, rows){
    if (err){
      req.flash('message', err);
      return res.redirect('/signin');
    } 

    // If token does not exist in the database, redirect user to the signin page.
    if (!rows.length) {
      return res.redirect('/signin');
    }

    // If user is already verified, return message to notify the user and redirect to signin page.
    verifyUser = rows[0].username 
    if (rows[0].isVerified == 1) {
      req.flash('message', 'Account is already verified. Please login to continue.');
      return res.redirect('/signin');
    }

    // If token is found in the database, update the isVerified field to 1, this allows the user to logon.
    connection.query("UPDATE tbl_users_test SET isVerified = 1 WHERE username = ?", [verifyUser], function (err, rows) {
      if (err) {
        req.flash('message', err);
        return res.redirect('/signin');            

      }
      console.log('')
      console.log("*** User successfully verified ***")
      console.log('')

      req.flash('message', 'Account Verified! Please login to continue.')
      return res.redirect('/signin')
    })
  })
});

/*-----------------------/VERIFYDELETE LINK------------------------*/

// This function is used to check the '?id=' query against the /verifydelete link.
// If a correct verificationToken query is parsed correctly using this link, the associated user account will be deleted.

app.get('/verifydelete', function(req,res) {
  var queryParameter = req.query.id;
  console.log('')
  console.log("/verifydelete Callback Query ID = " + req.query.id)
  
  
  connection.query("DELETE FROM tbl_users_test WHERE verificationToken = ?", [queryParameter], function (err, rows) {
    if (err) {
      req.flash('message', err);
      return res.redirect('/signin');
    }

    if (rows.affectedRows == 0) {
      req.flash('message', 'No Account Found');
      return res.redirect('/signin')
    }

    console.log('')
    console.log("*** Account Deleted ***")
    console.log('')

    req.flash('message', 'Account Successfully Deleted.')
    return res.redirect('/signin')
  })
});

/*-----------------------/DELETEACCLINK------------------------*/

// This function is used to delete a user's account.

app.get('/deleteacc', function (req, res) {

  if (!req.session.user) {
    req.flash('message', 'Please sign in to continue.');
    return res.redirect('/signin');
  }

  if (req.session.user) {
    userDBID = req.session.user.id;
    req.logout();

    connection.query("DELETE FROM tbl_users_test WHERE id = ?", [userDBID], function (err, rows) {
      if (err) {
        req.flash('message', err)
        return res.render('user', { message: req.flash('message') });
      }

      if (rows.affectedRows == 0) {
        req.flash('message', 'Account Delete unsuccessful')
        return res.render('user', { message: req.flash('message') });
      }

      req.flash('message', 'Account Deleted.')
      return res.redirect('/signin')




    })
  }
})































/*-----------------------CONTACT US FORM HANDLING-----------------------*/

app.post("/contactus", function (req, res, done) {

  // Set variables from req.body
  var formName = req.body.name;
  var formEmail = req.body.email;
  var formMessage = req.body.message;

  // Get the current date and time.
  var today = new Date();
  var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  // Contact Us Form Mail Options
  mailOptions = {
    from: '"Dashboard Application" <leepjwallace@gmail.com>',
    to: 'leepjwallace@gmail.com',
    replyTo: formEmail, // When the administrator replies to the email, they will reply directly to the email address provided in the form. 
    subject: "Contact Us Form Submitted",
    html: "<center><h3><u>Contact Us Form</u></h3><h4>Name: </h4>" + formName + " <br><h4>Email: </h4>" + formEmail + "<br><h4>Message:</h4> '" + formMessage + "' <h4>Sent at:</h4> " + dateTime + "</center>"
  }

  // Handle smtp Transport Error Handling
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log("smtpTransport ERROR: " + error);
      req.flash('message', 'smtpTransport ERROR.')
      return res.redirect("/signin");
    } else {
      console.log("Message sent: " + response.message);
      req.flash('message', 'Contact Form Submitted! Please expect a response within 24 hours.')
      return res.redirect("/signin");
    }
  })
})


/*-----------------------------CHANGE AUTHENTICATED USER PASS-------------------------------*/

app.post("/change-auth-password", function (req, res, done) {
  // Form Validation is needed here

  newPass = req.body.passwordChange;
  newPassConfirm = req.body.confirmPasswordChange;

  if (newPass !== newPassConfirm) {

    req.flash('message', 'Passwords do not match. Please try again.')
    return res.render('user', { message: req.flash('message') });

  }

  var newPassSalt = process.env.SALT; //ensure that this is in the environment for the future
  newPassSalt = newPassSalt + '' + newPass;
  var encNewPass = crypto.createHash('sha1').update(newPassSalt).digest('hex');
  console.log("\n *** The New Encoded password is: " + encNewPass + " ***")

  currUser = req.user.username;

  console.log("\n *** Changing password for user: " + currUser + " *** \r")

  var newPassSql = "UPDATE tbl_users_test SET password = '" + encNewPass + "' WHERE username = '" + currUser + "'";
  // var newPassSql = "UPDATE tbl_users_test set password = 'random' where username = 'testuser';"

  connection.query(newPassSql, function (err, result) { //values inserted into the query
    if (err) throw err;
    console.log("\n *** Success! Password Changed *** \n"); // logs a success of the operation in the console.
    req.flash('message', 'Password change successful! Please login to continue.')
    req.logout();
    res.redirect('/signin');
  })

});

/*-----------------------------CHANGE USER PASS-------------------------------*/

app.get("/passchange", function(req, res) {

  var passQueryParameter = req.query.id;

  console.log("/passchange query ID = " + passQueryParameter)
  
  connection.query("SELECT * FROM tbl_users_test WHERE passwordResetToken = ?", [passQueryParameter], function (err, rows){
    if (err){
      req.flash('message', err);
      return res.redirect('/signin');
    } 

    // If password reset token does not exist in the database, redirect user to the signin page.
    if (!rows.length) {
      return res.redirect('/signin');
    }

    passChangeUser = rows[0].username 
    passChangeUserEmail = rows[0].email
    randomPassChangeNo = Math.floor((Math.random() * 100) + 54);
    console.log("Random verification number: " + randomPassChangeNo);
  
    newPasswordSalt = randomPassChangeNo + '' + passChangeUser
    var newPassword = crypto.createHash('sha1').update(newPasswordSalt).digest('hex');

    console.log(newPassword);
    console.log("New Password: "+ newPasswordSalt) // This is the new password that should be sent to the user.

    var PasswordChangeSalt = process.env.SALT;
    salt = PasswordChangeSalt + '' + newPasswordSalt
    var newPass = crypto.createHash('sha1').update(salt).digest('hex'); 

    connection.query("UPDATE tbl_users_test SET password = ? WHERE username = ?", [newPass, passChangeUser], function (err, rows) {
      if (err) {
        req.flash('message', err);
        return res.redirect('/signin');
      }
      console.log('')
      console.log("*** User password reset ***")
      console.log('')
      req.flash('message', 'Password Reset. Please check your emails for your new login.')
      return res.redirect('/signin')
    })

    host = req.get('host');
    contactUsLink = "http://"+req.get('host')+"/contactus";
    ErrEmailLink = "http://"+req.get('host')+"/verifydelete";

    mailOptions = {
      from: '"Dashboard Application" <leepjwallace@gmail.com>',
      to: passChangeUserEmail,
      subject: "New Login Information",
      html: "<center>Hello "+ passChangeUser +",<br><br> Your password has successfully been reset.<br><br>Please change your password as soon as you login.<br><br><b>New Password: </b>" + newPasswordSalt + "<br><br>If you have received this email in error, please <a href=" + ErrEmailLink + ">click here</a> so we can remove your email from our records or <br><br><a href=" + contactUsLink + "> Contact Us </a> for any further information.</center>"
    }
    // console.log("These are the mailOptions " + mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log("smtpTransport ERROR: " + error);
        req.flash('message', 'smtpTransport ERROR.')
        return res.redirect("/signin");
      } else {
        console.log("Message sent: " + response.message);
        // req.flash('message', 'Registration Successful! Please check your emails to verify your account.')
        return res.redirect("/signin");
      }
    })
  })
})

app.post("/modifyUser", function (req, res) {

  user = req.body.selectUser

  connection.query("SELECT * FROM tbl_users_test WHERE username = ?", [user], function (err, rows) {
    if (err) {
      req.flash('message', 'Database Error' + err)
      return res.redirect('/signin')
    }
    if (!rows.length) {
      req.flash('message', '* User "' + user + '" Does Not Exist *')
      return res.render('admin', { message: req.flash('message') });
    }

    // Success Message rendered to admin page.
    req.flash('success', '* User "' + user + '" Exists *')
    return res.render('admin', {success: req.flash('success') });
  })
})



/*-----------------------------CHANGE UNAUTHENTICATED USER PASS-------------------------------*/

app.post("/change-unauth-password", function (req, res, done) {

  passEmail = req.body.email;

  // Salt is a random number appended to the email address. Both are unique values which is excellent for security.
  randomPassNo = Math.floor((Math.random() * 100) + 54);
  console.log("Random verification number: " + randomPassNo);

  hashedEmailSalt = randomPassNo + '' + passEmail

  var passVerificationToken = crypto.createHash('sha1').update(hashedEmailSalt).digest('hex'); 
  console.log(passVerificationToken);

  host = req.get('host');
  passLink = "http://"+req.get('host')+"/passchange?id="+passVerificationToken;

  connection.query("SELECT * FROM tbl_users_test WHERE email = ?", [passEmail], function(err, rows){
    if (err) {
      req.flash('message', err)
      return res.redirect('/sigin')
    }
    if (!rows.length) {
      console.log('Email does not exist in database')

      req.flash('message', '* Email does not exist in the Database. Are you sure you have entered it correctly? *')
      return res.render('changepassword', { message: req.flash('message') });
    }
    console.log('Email has been found in the database')
  })
  
  connection.query("UPDATE tbl_users_test SET passwordResetToken = ? WHERE email = ?", [passVerificationToken, passEmail], function(err, rows) {
    if (err) {
      req.flash('message', err);
      return res.redirect('/signin');
    } 
    if (rows.length) {  
      console.log("*** Password RESET where email = " + passEmail + " ***")
    }
  })

  contactUsLink = "http://"+req.get('host')+"/contactus";

  mailOptions = {
    from: '"Dashboard Application" <leepjwallace@gmail.com>',
    to: passEmail,
    subject: "Password Reset Request",
    html: "<center>Hello, <br><br> Please use the link below to reset your password<br><br><a href=" + passLink + ">Click Here to reset password</a><br><br><a href=" + contactUsLink + "> Contact Us</a></center>"
  }
  // console.log("These are the mailOptions " + mailOptions);
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log("smtpTransport ERROR: " + error);
      req.flash('message', 'smtpTransport ERROR.')
      return res.redirect("/signin");
    } else {
      console.log("Message sent: " + response.message);

      req.flash('success', '* Password reset link sent successfully *')
      return res.render('changepassword', { success: req.flash('success') });






      req.flash('message', 'Password reset link sent.')
      return res.redirect("/signin");
    }
  })

  


  /*
  newUser = req.body.newPasswordUsername;
  newPass = req.body.newPassword;

  var unauthPassSalt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6'; //ensure that this is in the environment for the future
  unauthPassSalt = unauthPassSalt + '' + newPass;
  var encNewPass = crypto.createHash('sha1').update(unauthPassSalt).digest('hex');
  console.log("\n *** The New Encoded password is: " + encNewPass + " ***")

  console.log("\n *** Changing password for user: " + newUser + " *** \r")

  var newPassSql = "UPDATE tbl_users_test SET password = '" + encNewPass + "' WHERE username = '" + newUser + "'";
  // var newPassSql = "UPDATE tbl_users_test set password = 'random' where username = 'testuser';"

  connection.query(newPassSql, function (err, result) { //values inserted into the query
    if (err) throw err;
    console.log("\n *** Success! Password Changed *** \n"); // logs a success of the operation in the console.
    req.flash('message', 'Password change successful!')
    res.redirect('/signin');

  })
  */
});

/*--------------------ADMINISTRATOR DASHBOARD FUNCTIONS-----------------------*/

app.post("/admin-reset-password", function(req, res) {

  var selectResetUser = req.body.selectResetUser;
  
  connection.query("SELECT * FROM tbl_users_test WHERE username = ?", [selectResetUser], function (err, rows){
    if (err){
      req.flash('message', err);
      return res.redirect('/signin');
    } 

    // If password reset token does not exist in the database, redirect user to the signin page.
    if (!rows.length) {
      console.log('')
      console.log('No User Found')
      console.log('')
      req.flash('message', '* User "' + selectResetUser + '" Not Found *')
      return res.render('admin', { message: req.flash('message') });
    }

    passChangeUserEmail = rows[0].email
    randomPassChangeNo = Math.floor((Math.random() * 100) + 54);
    console.log("Random verification number: " + randomPassChangeNo);
  
    newPasswordSalt = randomPassChangeNo + '' + selectResetUser
    var newPassword = crypto.createHash('sha1').update(newPasswordSalt).digest('hex');

    console.log(newPassword);
    console.log("New Password: "+ newPasswordSalt) // This is the new password that should be sent to the user.

    var PasswordChangeSalt = process.env.SALT;
    salt = PasswordChangeSalt + '' + newPasswordSalt
    var newPass = crypto.createHash('sha1').update(salt).digest('hex'); 

    connection.query("UPDATE tbl_users_test SET password = ? WHERE username = ?", [newPass, selectResetUser], function (err, rows) {
      if (err) {
        req.flash('message', 'Database Error');
        return res.redirect('/admin');
      }
      console.log('')
      console.log("*** User password reset ***")
      console.log('')
    })

    host = req.get('host');
    contactUsLink = "http://"+req.get('host')+"/contactus";
    ErrEmailLink = "http://"+req.get('host')+"/verifydelete";

    mailOptions = {
      from: '"Dashboard Application" <leepjwallace@gmail.com>',
      to: passChangeUserEmail,
      subject: "New Login Information",
      html: "<center>Hello "+ selectResetUser +",<br><br> Your password has been reset by an Administrator.<br><br>Please change your password as soon as you login.<br><br><b>New Password: </b>" + newPasswordSalt + "<br><br>If you have received this email in error, please <a href=" + ErrEmailLink + ">click here</a> so we can remove your email from our records or <br><br><a href=" + contactUsLink + "> Contact Us </a> for any further information.</center>"
    }
    // console.log("These are the mailOptions " + mailOptions);
    smtpTransport.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log("smtpTransport ERROR: " + error);
        req.flash('message', 'smtpTransport ERROR.')
        return res.redirect("/signin");
      } else {
        console.log("Message sent: " + response.message);
        req.flash('success', '* User "' + selectResetUser + '" Password Reset *')
        return res.render('adminResetUserPass', { success: req.flash('success') });
      }
    })
  })
})

app.post("/admin-delete-user", function (req, res) {

  var deleteUser = req.body.selectDeleteUser;

  if (deleteUser == req.session.user) {

    req.flash('message', '* Error: You are currently signed in as this user. *')
    return res.render('adminDeleteUser', { message: req.flash('message') });

  }

  connection.query("DELETE FROM tbl_users_test WHERE username = ?", [deleteUser], function (err, rows) {
    if (err) {
      req.flash('message', '* Database Error *')
      return res.render('adminDeleteUser', { message: req.flash('message') });
    }

    console.log(rows)

    if (rows.affectedRows == 0) {
      req.flash('message', '* User "' + deleteUser + '" not found *')
      return res.render('adminDeleteUser', { message: req.flash('message') });
    }

    req.flash('success', '* User Account "' + deleteUser + '" has been deleted *')
    return res.render('adminDeleteUser', { success: req.flash('success') });
    
  })
})

app.post("/admin-change-username", function(req, res) {

  // Perhaps try to add in a dynamic dropdown of users here.

  existingUser = req.body.selectChangeUsername;
  newUsername = req.body.selectChangeUsernameNew;

  connection.query("UPDATE tbl_users_test SET username = ? WHERE username = ?", [newUsername, existingUser], function(err, rows){
    if (err) {
      req.flash('message', 'Database Error')
      return res.render('admin', { message: req.flash('message') });
    }

    console.log('ADMIN: Username successfully changed')
    req.flash('success', 'Username has been successfully changed!')
    return res.render('adminChangeUsername', { success: req.flash('success') });
   })
  })















/*-----------------------------OTHER FUNCTIONS-------------------------------*/

// When logging out, this code will 'destroy' the session and redirect the user to the /signin page.
app.get('/logout', function (req, res) {
  req.session.destroy();
  req.logout();
  res.redirect('/');
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('404: Page Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page - will render a 404 error alongside an error stack for this.
  res.status(err.status || 500);
  res.render('error');
});

// Function is used for checking if a username is currently in use in the database.
function isUsernameInUse(username){
  return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) AS total FROM tbl_users_test WHERE username = ?', [username], function (error, results, fields) {
          if(!error){
              // This can be commented out. Prints the count of results found.
              console.log("USERNAME COUNT : "+results[0].total);
              return resolve(results[0].total > 0);
          } else {
              return reject(new Error('Database Error'));
          }
        }
      );
  });
}

// Function is used for checking if an email is currently in use in the database.
function isEmailInUse(email){
  return new Promise((resolve, reject) => {
      connection.query('SELECT COUNT(*) AS total FROM tbl_users_test WHERE email = ?', [email], function (error, results, fields) {
          if(!error){
              // This can be commented out. Prints the count of results found.
              console.log("EMAIL COUNT : "+results[0].total);
              return resolve(results[0].total > 0);
          } else {
              return reject(new Error('Database Error'));
          }
        }
      );
  });
}




// Testing Google Recaptcha
function verifyCaptcha() {
  document.getElementById('g-recaptcha-error').innerHTML = '';
}

module.exports = app;


// REFERENCES

// https://www.w3docs.com/snippets/nodejs/how-to-redirect-a-web-page-with-node-js.html