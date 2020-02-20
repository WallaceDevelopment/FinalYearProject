// Set modules as variables
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//include express validator

// Set routes for html pages - new pages need to be added here to link them with their route files
var index = require('./routes/index');
var users = require('./routes/users');
var register = require('./routes/register'); 

// 'app' is used in place of express for readability
var app = express();

// Setup for pug as a view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var flash    = require('connect-flash'); //connect-flash is used for storing messages in a 'session' (when a user is logged in)
var crypto   = require('crypto'); //crypto implements crytographic functionalities, used in this instance for salting passwords

// Login Script. This is provided by Programmerblog.net.
var passport = require('passport');
var LocalStrategy  = require('passport-local').Strategy; // passport-local authenticates with a username and password
var connection     = require('./lib/dbconn'); // dbconn file in lib contains MySQL credentials to AWS RDS database.

 var sess  = require('express-session'); // express-session handles user sessions
 var Store = require('express-session').Store
 var BetterMemoryStore = require(__dirname + '/memory')
 var store = new BetterMemoryStore({ expires: 60 * 60 * 1000, debug: true }) // session handling in memory
 app.use(sess({
    name: 'FinalYearProject-Session', // session name
    secret: '749ed3c859', // session secret
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

app.use('/', index); // On starting, the '/' file path will route to the index html file.
app.use('/users', users); // The /users file path will route to the users html file.
app.use('/register', register); // The /register file path will use the register js file for example.

// passport strategy -- the express session middleware before calling passport.session()
passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){
      console.log(username+' = '+ password);
      // if the username AND password are both null, then display a message.
      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); } 
      // the salt used for passwords in this system is found below, this will be kept within an environment variable.
      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
      // find username entered by the user.
      connection.query("select * from tbl_users where username = ?", [username], function(err, rows){
          console.log(err);
        if (err) return done(req.flash('message',err));

        // Will search for both username and password within the rows in the database, if not found, then produce message.
        if(!rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }
        // salt variable is updated, the password entered by the user is appended to the salt
        salt = salt+''+password;
        // using the crypto module, the variable encPassword is now a sha1 hash of the salt and password
        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
        var dbPassword  = rows[0].password;
        
        // If the hashed password is not found in the database, then produce message.
        if(!(dbPassword == encPassword)){
            return done(null, false, req.flash('message','Invalid username or password.'));
         }
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
    connection.query("select * from tbl_users where id = "+ id, function (err, rows){
        done(err, rows[0]);
    });
});

// navigating to /signin will render the login/index page
app.get('/signin', function(req, res){
  res.render('login/index',{'message' :req.flash('message')});
});

// using the local strategy of a username and a hashed password, this block of code will authenticate the user with
// a successful outcome redirecting to /users, where it will produce the visualisation dashboard
// an unsuccessful outcome will redirect the user to the /signin page.
app.post("/signin", passport.authenticate('local', {
    successRedirect: '/users',
    failureRedirect: '/signin',
    failureFlash: true
}), function(req, res, info){
    res.render('login/index',{'message' :req.flash('message')});
});

// Register Form Initial POST

app.post("/register", function(req, res, done){

  var values=[ // reads the post data from the /register form
  username = req.body.username,
  password = req.body.password,
  fullname = req.body.fullname 
  ]

  console.log(username)  // the console log at this point shows that the form has been parsed correctly with body-parser.
  console.log(fullname)
  console.log(password)

  

  // this establishes a connection with the database and inserts the parsed data above into tbl_users with variables.
  connection.connect(function(err) { 
    if (err) throw err;
    console.log("Connected!");
    var sql = "INSERT INTO tbl_users (username, password, full_name) VALUES ('"+username+"', '"+password+"', '"+fullname+"')"
    connection.query(sql, function (err, result) { //values inserted into the query
      if (err) throw err;
      req.flash('message', 'Registration successful! Log in to continue.')
      console.log("Success! : 1 record inserted"); // logs a success of the operation in the console.
      res.writeHead(302,{Location: '/users'}); // redirects the user after successul registration
      res.end()

    }) 
  }) 
    });

// VVV The function below, could this be used to redirect after registration and call a hidden function within users?

// When logging out, this code will 'destroy' the session and redirect the user to the /signin page.
app.get('/logout', function(req, res){
    req.session.destroy();
    req.logout();
    res.redirect('/signin');
});

// catch 404 and forward to error handler
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

  // render the error page - will render a 404 error alongside an error stack for this.
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// REFERENCES

// https://www.w3docs.com/snippets/nodejs/how-to-redirect-a-web-page-with-node-js.html