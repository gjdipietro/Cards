'use strict';

// Dependencies
var express = require('express');
var router = express.Router();
var passport = require('../../config/auth');
var sanitize = require('mongo-sanitize');

var multer  = require('multer');
var cardMulter = multer({dest: './public/img/cards'});
var avatarMulter = multer({dest: './public/img/avatars'});

var companyName = 'Greeting Cardinal';
var tagline = 'Greeting Cards that don\'t suck';

//Middleware
express().use(multer());

//Controllers
var userController = require('../controllers/user');
var cardController = require('../controllers/card');
var cartController = require('../controllers/cart');

// Routes
router.use(function (req, res, next) {
  console.log('..');
  next(); // make sure we go to the next routes and don't stop here
});

/*========================================
CARDS
=========================================*/
router.route('/post-card')
    .get(cardController.getPostCard);

router.route('/')
    .get(cardController.getAllCards);

router.route('/cards/post')
    .post(cardMulter, cleanBody, cardController.postCard);

router.route('/cards/:card_id')
    .get(cardController.getCard);

router.route('/cards/:card_id/edit')
    .get(cardController.getEditCard)
    .post(cardMulter, cleanBody, cardController.postEditCard);

router.route('/cards/:card_id/delete')
    .post(cardController.postDeleteCard);

router.route('/:username/:card_id/favorite')
    .post(cardController.postFavoriteCard);

/*========================================
CART
=========================================*/
router.route('/cart')
    .get(cartController.getUserCart);

router.route('/:username/:card_id/addToCart')
    .post(cartController.postAddToCart);

router.route('/:username/:card_id/deleteFromCart')
    .post(cartController.postDeleteFromCart);

/*========================================
PROFILE
=========================================*/
router.route('/u/')
    .get(userController.getAllUsers);

router.route('/account')
    .get(userController.getEditUser)
    .post(avatarMulter, cleanBody, userController.postEditUser);

router.route('/:username')
    .get(userController.getUser);

router.route('/:username/favorites')
    .get(userController.getUserFavorites);

/*========================================
SIGN IN AND REGISTER
=========================================*/
router.route('/register')
    .get(userController.getRegister)
    .post(cleanBody, userController.postRegister);

router.route('/signin')
    .get(userController.getSignin)
    .post(cleanBody, userController.postSignin);

router.route('/signout')
    .get(userController.signout);

router.route('/auth/facebook')
    .get(passport.authenticate('facebook', {scope: ['email', 'user_location']}));
router.route('/auth/facebook/callback')
    .get(passport.authenticate('facebook', {failureRedirect: '/login'}), function(req, res) {
      res.redirect(req.session.returnTo || '/');
    });

router.route('/auth/twitter')
    .get(passport.authenticate('twitter', {scope: ['email', 'user_location']}));
router.route('/auth/twitter/callback')
    .get(passport.authenticate('twitter', {failureRedirect: '/login'}), function(req, res) {
      res.redirect(req.session.returnTo || '/');
    });

/*========================================
INTERNAL
=========================================*/
router.route('/about')
    .get(function (req, res) {
      res.render('../views/pages/about', {
        docTitle: 'About ' + companyName, 
        pageTitle: 'About ' + companyName, 
      });
    });

var Orders = require('../models/orders');
router.route('/orders')
    .get(function (req, res) {
      Orders.find(function (err, orders) {
        if (!err) {
          res.render('../views/pages/orders_all', {
            docTitle: 'Orders ' + companyName,
            pageTitle: 'Orders ' + companyName,
            orders: orders
          }); 
        } else {
          res.send(err);
        }
      });
    });

function cleanBody(req, res, next) {
  req.body = sanitize(req.body);
  next();
}

// Return Router
module.exports = router;
