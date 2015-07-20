'use strict';

// Dependency
var passport = require('../../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var secrets = require('../../config/secrets');
var companyName = 'Greeting Cardinal';
var tagline = 'Greeting Cards that don\'t suck';

// Models
var Card = require('../models/cards');
var User = require('../models/users');

//GET Profile
exports.getUser = function (req, res) {
  User.findOne({username: req.params.username}, function (err, currUser) {
    if (currUser) {
      Card.find({user: currUser._id}, function (err, cards) {
        if (!err) {
          var un = currUser.username_display || currUser.username;
          res.render('../views/pages/user_single', {
            docTitle: un + ' \u00B7 ' + companyName,
            pageTitle: un,
            sub_title: 'Posted Cards',
            user: currUser,
            cards: cards
          }); 
        } else {
          res.send(err);
        }
      }); 
    } 
  });
};

//GET Favorites
exports.getUserFavorites = function (req, res) {
  User.findOne({username: req.params.username}, function (err, currUser) {
    if (currUser) {
      Card.find({_id : {$in : currUser.favorites}}, function (err, cards) {
        if (!err) {
          res.render('../views/pages/user_single', {
            docTitle: currUser.username + ' \u00B7 ' + companyName,
            pageTitle: currUser.username,
            sub_title: 'Favorites',
            user: currUser,
            cards: cards
          });
        } else {
          res.send(err);
        }
      });
    }
  });
};

//GET All Users
exports.getAllUsers = function (req, res) {
  User.find(function (err, users) {
    if (!err) {
      res.render('../views/pages/users_all', {
        docTitle: 'Users  \u00B7 ' + companyName,
        pageTitle: 'Browse Users',
        users: users
      });
    } else {
      res.send(err);
    }
  });
};

//GET Sign in
exports.getSignin = function (req, res) {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('../views/pages/signin', {
    docTitle: companyName + ' \u00B7 Sign In',
    pageTitle: 'Sign In',
  });
};

//POST Sign in
exports.postSignin = function (req, res, next) {
  var errors = req.validationErrors();
  req.assert('password', 'Password cannot be blank').notEmpty();
  if (errors) {
    req.flash('error', errors);
    return res.redirect('/i/signin');
  }
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', {msg: info.message});
      return res.redirect('/i/signin');
    }
    if (req.body.remember) {
      req.session.cookie.maxAge = 10000000 * 60 * 3;
    } else {
      req.session.cookie.expires = false;
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};

//GET Register
exports.getRegister = function (req, res) {
  res.render('../views/pages/register', {
    docTitle: companyName + ' \u00B7 Register',
    pageTitle: 'Register',
  });
};

//POST Register
exports.postRegister = function (req, res, next) {
  var user;
  var incompleteMsg;
  var emailTaken;
  var usernameTaken;
  var errors;
  var query;
  incompleteMsg = 'Please complete the fields.';
  emailTaken = 'An Account with that email address already exists.';
  usernameTaken = 'An Account with that username address already exists.';

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('username', 'Username is not valid').len(4);
  req.assert('password', 'Password must be at least 4 characters long').len(4);

  errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/i/register');
  }

  if (!req.body.email || !req.body.username || !req.body.password) {
    req.flash('error', {msg: incompleteMsg});
    return res.redirect('/i/register');
  }

  user = new User({
    email : req.body.email,
    username : req.body.username,
    password: req.body.password,
  });

  query = User.where({$or: [{email: req.body.email}, {username: req.body.username}]});
  query.findOne(function (err, existingUser) {
    if (existingUser || err) {
      req.flash('error', {msg: 'The email or username is taken!'});
      return res.redirect('/i/register');
    }
    user.save(function (err) {
      if (err) {
        res.send(err);
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

exports.signout = function(req, res) {
  req.logout();
  res.redirect('/');
};

/*
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'gjdipietro@gmail.com',
            pass: '81gerggreg1818'
        }
    });
    var mailOptions = {
        to: user.email,
        from: 'coolstuff.com',
        subject: 'You are registered',
        text: 'Hello,\n\n' +
          'This is an email'
    };
    transporter.sendMail(mailOptions, function(err) {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
    });
    */
