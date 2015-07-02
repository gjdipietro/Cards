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
var Orders = require('../models/orders');



//Cart and Checkout
exports.getUserCart = function (req, res) {
    if(req.user) {
        User.findOne({username: req.user.username}, function (err, currUser) {
            if(currUser) {
                Card.find({ _id : { $in : currUser.cart }  }, function (err, cards) {
                    if (!err) {
                        var total_price = 0;
                        for(var i = 0; i < cards.length; i++){
                            total_price += parseFloat(cards[i].attr.price);
                        }
                        res.render("../views/pages/cart", {
                            doc_title: "My Cart " + companyName, 
                            page_title: "My Cart", 
                            user: currUser,
                            cards: cards,
                            total_price: total_price
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

exports.postAddToCart = function (req, res) {
    Card.findById(req.params.card_id, function (err, card) {
        User.findById(req.user, function (err, user) {
            if (!err) {
                user.cart.push(card._id);
                user.save(function (err) {
                    if(!err) {
                        res.redirect("/i/cart/");
                    }
                }); 
            }
            else {
                res.redirect("/cards/"+card._id);
            }
        });
    });
};

exports.postDeleteFromCart = function (req, res) {
    Card.findById(req.params.card_id, function (err, card) {
        User.findById(req.user, function (err, user) {
            if (!err) {
                user.cart.splice(card._id);
                user.save(function (err) {
                    if(!err) {
                        res.redirect("/i/cart/");
                    }
                }); 
            }
            else {
                res.redirect("/cards/"+card._id);
            }
        });
    });
};
