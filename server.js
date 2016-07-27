'use strict';

// Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var multer  = require('multer');
var path = require('path');
var flash = require('express-flash');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');

var app = express();
var port = process.env.PORT || 1337;
var secrets = require('./config/secrets');
var passport = require('./config/auth');

// MongoDB Connect
mongoose.connect(secrets.db);

// Express Middleware
var sessionOpts = {
  saveUninitialized: true,
  resave: false,
  secret: secrets.sessionSecret,
  maxAge: new Date(Date.now() + 3600000),
  store: new MongoStore({mongooseConnection:mongoose.connection}, function (err)  {
    console.log(err || 'connect-mongodb setup ok');
  }),
  cookie: {
    httpOnly: true,
    maxAge: 2419200000
  },
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(compress());
app.use(cookieParser());
// Passport and configuration

app.use(flash());
app.use(expressValidator());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser(secrets.sessionSecret));
app.use(session(sessionOpts));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.auth_user = req.user;
  next();
});

// Routes
app.use('/api', require('./app/routes/api'));
app.use('/', require('./app/routes/routes'));
app.use(function (req, res) { 
  res.render('404.ejs'); 
});

// Start Server
app.listen(port);
console.log('APP is running on port ' + port);

