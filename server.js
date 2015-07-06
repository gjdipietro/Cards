'use strict';

// Dependencies
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer  = require('multer');
var path = require('path');
var flash = require('express-flash');


var mongoose = require('mongoose');
var expressValidator = require('express-validator');

// Express Middleware
var app = express();
var port = process.env.PORT || 1337; 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'app/views')); 
app.use(express.static(path.join(__dirname, 'public')));
app.use(compress()); 


// Passport and configuration
var secrets = require('./config/secrets');
var passport = require('./config/auth');
app.use(cookieParser());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: secrets.sessionSecret,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
    res.locals.auth_user = req.user;
    next();
});
app.use(flash());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());


// MongoDB Connect
mongoose.connect(secrets.db);


// Routes
app.use('/api', require('./app/routes/api'));
app.use('/', require('./app/routes/routes'));
app.use(function (req, res) { 
    res.render('404.ejs'); 
});


// Start Server
app.listen(port);
console.log('APP is running on port ' + port);




