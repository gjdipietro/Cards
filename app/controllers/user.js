'use strict';

// Dependency
var passport = require('../../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var secrets = require('../../config/secrets');
var companyName = "Snail Cards";
var tagline = "Greeting Cards that don't suck";


// Models
var Card = require("../models/cards");
var User = require('../models/users');


//GET Profile
exports.getUser = function (req, res) {
    User.findOne({username: req.params.username}, function (err, currUser) {
        if(currUser) {
            Card.find({ user: currUser._id }, function (err, cards) {
                if (!err) {
                    res.render("../views/pages/user_single", {
                        doc_title: currUser.username + ' \u00B7 ' + companyName, 
                        page_title: currUser.username,
                        sub_title: "Posted Cards", 
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
        if(currUser) {
            Card.find({ _id : { $in : currUser.favorites }  }, function (err, cards) {
                if (!err) {
                    res.render("../views/pages/user_single", {
                        doc_title: currUser.username + ' \u00B7 ' + companyName, 
                        page_title: currUser.username, 
                        sub_title: "Favorites",
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
            res.render("../views/pages/users_all", {
                doc_title: "Users  \u00B7 " + companyName, 
                page_title: "Browse Users",
                users: users
            }); 
        } else {
            res.send(err);
        }
    });
};



//GET Cart
exports.getUserCart = function (req, res) {
    if(req.user) {
        User.findOne({username: req.user.username}, function (err, currUser) {
            if(currUser) {
                console.log(currUser.cart);
                Card.find({ _id : { $in : currUser.cart }  }, function (err, cards) {
                    if (!err) {
                        res.render("../views/pages/cart", {
                            doc_title: "My Cart " + companyName, 
                            page_title: "My Cart", 
                            user: currUser,
                            cards: cards
                        }); 
                    } else {
                         res.send(err);
                    }
                }); 
            } 
        });
    }
    else {
        res.redirect('/i/signin');
    }    
};





//GET Sign in
exports.getSignin = function (req, res) {
    if (req.user) { 
        return res.redirect('/');
    }
    res.render("../views/pages/signin", {
        doc_title: "Sign In " + companyName,
        page_title: "Sign In", 
    });
};

//POST Sign in
exports.postSignin = function (req, res, next) {
    req.assert('password', 'Password cannot be blank').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors);
        return res.redirect("/i/signin");
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user) {
            req.flash('error', { msg: info.message });
            return res.redirect("/i/signin");
        }
        req.logIn(user, function (err) {
            if (err) return next(err);
            res.redirect(req.session.returnTo || '/');
        });  
    })(req, res, next);
};

//GET Register
exports.getRegister = function (req, res) {
    res.render("../views/pages/register", {
       doc_title: "Register In " + companyName,
       page_title: "Register", 
    });
};

//POST Register
exports.postRegister = function (req, res) {
    var user = new User({
        email : req.body.email,
        username : req.body.username,
        password: req.body.password,
    });
    User.findOne({ email: req.body.email }, function (err, existingUser) {
        if (existingUser) {
            req.flash("error", {msg: "An Account with that email address already exists."});
            return res.redirect('/i/register');
        }
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
        user.save(function (err) {
            if (err) {
                res.send(err);
            } 
            req.logIn(user, function (err) {
                if (err) return next(err);
                res.redirect('/');
            });
        });
    });
};

exports.signout = function(req, res) {
    req.logout();
    res.redirect("/");
};



