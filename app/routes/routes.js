'use strict';

// Dependencies
var express = require("express");
var router = express.Router();
var passport = require('../../config/auth');

var multer  = require('multer');
var cardMulter = multer({dest: './public/img/cards'});
var companyName = "Snail Cards";
var tagline = "Greeting Cards that don't suck";


//Middleware
express().use(multer());


//Controllers
var userController = require("../controllers/user");
var cardController = require("../controllers/card");
var cartController = require("../controllers/cart");



// Routes
router.use(function (req, res, next) {
    console.log("..");
    next(); // make sure we go to the next routes and don't stop here
});



/*========================================
CARDS
=========================================*/
router.route('/i/post-card')
    .get(cardController.getPostCard);

router.route('/')
    .get(cardController.getAllCards);

router.route('/cards/post')
    .post(cardMulter, cardController.postCard);

router.route("/cards/:card_id")
    .get(cardController.getCard);

router.route('/cards/:card_id/edit')
    .get(cardController.getEditCard)
    .post(cardMulter, cardController.postEditCard);

router.route('/cards/:card_id/delete')
    .post(cardController.postDeleteCard);

router.route("/:username/:card_id/favorite")
    .post(cardController.postFavoriteCard);


/*========================================
CART
=========================================*/
router.route("/i/cart")
    .get(cartController.getUserCart);

router.route("/:username/:card_id/addToCart")
    .post(cartController.postAddToCart);

router.route("/:username/:card_id/deleteFromCart")
    .post(cartController.postDeleteFromCart);


/*========================================
PROFILE
=========================================*/
router.route("/i/u/")
    .get(userController.getAllUsers);

router.route("/:username")
    .get(userController.getUser);

router.route("/:username/favorites")
    .get(userController.getUserFavorites);




/*========================================
SIGN IN AND REGISTER
=========================================*/
router.route("/i/register")
    .get(userController.getRegister)
    .post(userController.postRegister);

router.route("/i/signin")
    .get(userController.getSignin)
    .post(userController.postSignin);

router.route("/i/signout")
    .get(userController.signout);


router.route("/auth/facebook")
    .get(passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
router.route("/auth/facebook/callback")
    .get(passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
        res.redirect(req.session.returnTo || '/');
    });

router.route("/auth/twitter")
    .get(passport.authenticate('twitter', { scope: ['email', 'user_location'] }));
router.route("/auth/twitter/callback")
    .get(passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
        res.redirect(req.session.returnTo || '/');
    });


/*========================================
INTERNAL
=========================================*/
router.route('/i/about')
    .get(function (req, res) {
        res.render("../views/pages/about", {
            doc_title: "About " + companyName, 
            page_title: "About " + companyName, 
        });
    });

var Orders = require('../models/orders');
router.route('/i/orders')
    .get(function (req, res) {
        Orders.find(function (err, orders) {
            if (!err) {
                res.render("../views/pages/orders_all", {
                    doc_title: "Orders " + companyName,
                    page_title: "Orders " + companyName,
                    orders: orders
                }); 
            } else {
                res.send(err);
            }
        });
    });



// Return Router
module.exports = router;