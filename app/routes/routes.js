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
var userController = require("../../controllers/user");
var cardController = require("../../controllers/card");


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
    

router.route('/cards/:card_id/delete')
    .post(cardController.postDeleteCard);



/*========================================
USERS
=========================================*/
router.route("/i/u/")
    .get(userController.getAllUsers);

router.route("/:username")
    .get(userController.getUser);

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







// Return Router
module.exports = router;