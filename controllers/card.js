'use strict';

// Dependency
var express = require("express");
var router = express.Router();
var companyName = "Snail Cards";
var tagline = "Greeting Cards that don't suck";


// Models
var Card = require("../app/models/cards");
var User = require('../app/models/users');


exports.getPostCard = function (req, res) {
    if (!req.user) return res.redirect('/signin');
    res.render("../views/pages/card_post", {
        doc_title: "Post a card  \u00B7 " + companyName, 
        page_title: "Post a card",
    });
}

exports.postCard = function (req, res) {
    var imgUrl, card;
    if (req.files.image && req.files.image.size < 200000) {
        imgUrl = "/img/cards/" + req.files.image.name;
    } else {
        imgUrl = "/img/cards/default.png";
    }
    card = new Card({
        title: req.body.title,
        description : req.body.description,
        user: req.user._id,
        image: imgUrl
    });
    card.save(function (err) {
        if (err) {
            res.send(err);
        } else {
            res.redirect("/cards/"+card._id);
        }
    });       
};

exports.getAllCards = function (req, res) {
    Card.find().populate('user').exec(function (err, cards) {
        if (!err) {    
            res.render("../views/pages/card_all", {
                doc_title: companyName + " \u00B7 " + tagline,
                page_title: "Discover Cards", 
                cards: cards,
            }); 
        } else {
            res.send(err);
        }
    });
}

exports.getCard = function (req, res) {
    Card.findById(req.params.card_id, function (err, card) {
        User.findById(card.user, function (err, user) {
            var myCard = false;
            if (req.user) {
                if ( card.user.equals(req.user._id) ) { 
                    myCard = true;
                }
            }
            if (!err) {
                res.render("../views/pages/card_single", {
                    doc_title: card.title + " \u00B7 " + companyName,
                    page_title: card.title, 
                    card: card,
                    user: user,
                    myCard: myCard
                }); 
            } else {
                res.send(err);
            }  
        });
    });
}

exports.postDeleteCard = function (req, res) {
    Card.findById(req.params.card_id, function (err, card) {
        if(!req.user) {
            res.redirect("/cards/"+card._id);
        } 
        else {
            if (card.user.equals(req.user._id)) {
                Card.remove({ _id: req.params.card_id }, function(err, card) {
                    if (err) {
                        res.send(err);
                    } else {               
                        res.redirect("/u/"+req.user._id);
                    }
                });
            }
            else {
                res.redirect("/cards/"+card._id);
            }
        }
    })
};