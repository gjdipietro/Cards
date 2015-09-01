'use strict';

// Dependency
var exports, require;
var passport = require('../../config/auth');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var secrets = require('../../config/secrets');
var numeral = require('numeral');

// Models
var Card = require('../models/cards');
var User = require('../models/users');
var Orders = require('../models/orders');

//Cart and Checkout
exports.getUserCart = function (req, res) {
  if (req.user) {
    User.findOne({username: req.user.username}, function (err, currUser) {
      if (currUser) {
        Card.find({_id : {$in : currUser.cart}}, function (err, cards) {
          if (!err) {
            var totalPrice = 0, indivPrice = [];
            for (var i = 0; i < cards.length; i++) {
              totalPrice += parseFloat(cards[i].attr.price);
              indivPrice.push(numeral(cards[i].attr.price).format('$0,0.00'));
            }
            res.render('../views/pages/cart', {
              docTitle: 'Cart',
              pageTitle: 'Cart',
              user: currUser,
              indivPrice: indivPrice,
              cards: cards,
              totalPrice: numeral(totalPrice).format('$0,0.00')
            });
          } else {
            res.send(err);
          }
        });
      }
    });
  } else {
    req.session.returnTo = '/cart';
    res.redirect('/signin');
  }
};

exports.postAddToCart = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(req.user, function (err, user) {
      if (!err) {
        user.cart.push(card._id);
        user.save(function (err) {
          if (!err) {
            var cartCookie;
            if (req.cookies.cart) {
              cartCookie = req.cookies.cart;
            } else {
              cartCookie = [];
            }
            cartCookie.push(req.params.card_id);
            res.cookie('cart', cartCookie, {
              maxAge: 900000,
              httpOnly: true
            });
            res.redirect('/cart/');
          }
        });
      } else {
        res.redirect('/cards/' + card._id);
      }
    });
  });
};

exports.postDeleteFromCart = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(req.user, function (err, user) {
      if (!err) {
        for (var i = user.cart.length - 1; i >= 0; i--) {
          if (user.cart[i].equals(card._id)) {
            user.cart.splice(i, 1);
          }
        }
        user.save(function (err) {
          if (!err) {
            res.redirect('/cart/');
          }
        });
      } else {
        res.redirect('/cards/' + card._id);
      }
    });
  });
};

exports.postCheckout = function (req, res) {
  ;
};