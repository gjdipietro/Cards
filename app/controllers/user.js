'use strict';

// Dependency
var passport = require('../../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var companyName = 'Greeting Cardinal';
var tagline = 'Greeting Cards that don\'t suck';

// Models
var Card = require('../models/cards');
var User = require('../models/users');

//GET Profile
exports.getUser = function (req, res, next) {
  User.findOne({username: req.params.username}, function (err, currUser) {
    if (currUser) {
      var isMyProfile = false;
      if (req.user) {
        isMyProfile = currUser._id.equals(req.user._id);
      }

      Card.find({user: currUser._id}, function (err, cards) {
        if (!err) {
          var un = currUser.usernameDisplay || currUser.username;
          res.render('../views/pages/user_single', {
            docTitle: un + ' \u00B7 ' + companyName,
            pageTitle: un,
            sub_title: 'Posted Cards',
            user: currUser,
            isMyProfile: isMyProfile,
            cards: cards
          }); 
        } else {
          res.send(err);
        }
      });
    } else {
      next();
    }
  });
};

exports.getEditUser = function (req, res) {
  if (req.user) {
    User.findOne({username: req.user.username}, function (err, currUser) {
      if (currUser) {
        Card.find({user: currUser._id}, function (err, cards) {
          if (!err) {
            res.render('../views/pages/user_edit', {
              docTitle: 'Settings' + ' \u00B7 ' + companyName,
              pageTitle: 'Settings',
              user: currUser,
            });
          } else {
            res.send(err);
          }
        });
      }
    });
  }
  else {
    req.session.returnTo = '/account';
    res.redirect('/signin');
  }
};

exports.postEditUser = function (req, res) {
  //make sure user is doing this to themselves
  User.findById(req.user._id, function (err, user) {
    if (user) {

      if (req.files.picture && req.files.picture.size < 2000000) {
        var imgUrl;
        imgUrl = '/img/avatars/' + req.files.picture.name;
        user.profile.picture = imgUrl;
      }

      user.profile.name = req.body.name;
      user.profile.bio = req.body.bio;
      user.profile.location = req.body.location;
      user.profile.website = req.body.website;
      user.save(function (err) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/account');
        }
      });
    }
  });
};

//GET Favorites
exports.getUserFavorites = function (req, res) {
  User.findOne({username: req.params.username}, function (err, currUser) {
    if (currUser) {
      var isMyProfile = false;
      if (req.user) {
        isMyProfile = currUser._id.equals(req.user._id);
      }

      Card.find({_id : {$in : currUser.favorites}}, function (err, cards) {
        if (!err) {
          res.render('../views/pages/user_single', {
            docTitle: currUser.username,
            pageTitle: currUser.username,
            sub_title: 'Favorites',
            user: currUser,
            isMyProfile: isMyProfile,
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
    return res.redirect('/signin');
  }
  passport.authenticate('local', function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', {msg: info.message});
      return res.redirect('/signin');
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
  usernameTaken = 'An Account with that username already exists.';

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('username', 'Username is not valid').len(4);
  req.assert('password', 'Password must be at least 4 characters long').len(4);

  errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/register');
  }

  if (!req.body.email || !req.body.username || !req.body.password) {
    req.flash('error', {msg: incompleteMsg});
    return res.redirect('/register');
  }

  if (isInvalidUsername(req.body.username)) {
    req.flash('error', {msg: usernameTaken});
    return res.redirect('/register');
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
      return res.redirect('/register');
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

function isInvalidUsername(un) {
  var invalidUsernames = ['edit', 'settings', 'about', 'cart', 'orders', 'account', 'signin', 'signout', 'post-card', 'register', 'search', 'cards', 'card', 'help', 'blog', 'post'];
  for (var i = 0; i < invalidUsernames.length; i++) {
    if (invalidUsernames[i] === un) {
      return true;
    }
  }
  return false;
}
