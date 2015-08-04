'use strict';

// Dependencies
var express = require("express");
var router = express.Router();
var multer  = require('multer');
var cardMulter = multer({dest: './public/img/cards'});

// Models
var Card = require("../models/cards");
var User = require("../models/users");

//Middleware
express().use(multer());

// Routes
router.route('/cards')
    .get(function (req, res) {
      Card.find(function (err, cards) {
        if (err) {
          res.send(err);
        } else {
          res.json(cards);
        }
      });
    })
    .post(cardMulter, function (req, res) {
      var imgUrl, card;
      if (req.files.image && req.files.image.size < 200000) {
        imgUrl = "/img/cards/" + req.files.image.name;
      } else {
        imgUrl = "/img/cards/default.png";
      }
      card = new Card({
        title: req.body.title,
        description : req.body.description,
        price : req.body.price,
        user: req.user._id,
        image: imgUrl
      });
      card.save(function (err) {
        if (err) {
          res.send(err);
        } else {
          res.json({message: 'Card created!'});
        }
      });       
    });

router.route('/cards/:card_id')
    .get(function (req, res) {
      Card.findById(req.params.card_id, function (err, card) {
        if (err) { 
          res.send(err);
        } else {
          res.send(card);
        }
      });
    })
    .delete(function (req, res) {
      Card.remove({
        _id: req.params.card_id
      }, 
        function(err, card) {
          if (err) {
            res.send(err);
          } else {               
            res.json({message: 'Successfully deleted'});
          }
        });
    });

router.route('/users')
   .get(function (req, res) {
     User.find(function (err, users) {
       if (err) {
         res.send(err);
       } else {
         res.json(users);
       }
     });
   })
   .post(function (req, res) {
     var user = new User({
       email : req.body.email,
       password: req.body.password,
       profile : {
         name: req.body.name,
         bio : req.body.bio,
         picture: req.body.picture
       }
     });
     user.save(function (err) {
       if (err) {
         res.send(err);
       } else {
         res.json({message: 'New User created!'});
       }
     });
   });

router.route('/users/:users_id')
    .get(function (req, res) {
      User.findById(req.params.users_id, function (err, user) {
        Card.find({user: req.params.users_id}, function (err, cards) {
          if (!err) {
            user.cards = cards;
            res.json(user);
          }   
        });
            
      });
    })
    .delete(function (req, res) {
      User.remove({
        _id: req.params.users_id
      }, 
        function(err, user) {
          if (err) {
            res.send(err);
          } else {               
            res.json({message: 'Successfully deleted user'});
          }
        });
    });
    
// Return Router
module.exports = router;
