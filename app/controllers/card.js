'use strict';

// Dependency
var express = require("express");
var router = express.Router();
var companyName = 'Greeting Cardinal';
var tagline = 'Greeting Cards that don\'t suck';

// Models
var Card = require('../models/cards');
var User = require('../models/users');

exports.getPostCard = function (req, res) {
  if (!req.user) {
    req.session.returnTo = '/post-card';
    return res.redirect('/signin');
  }
  res.render('../views/pages/card_post', {
    docTitle: 'Post a card  \u00B7 ' + companyName,
    pageTitle: 'Post a card',
  });
};

exports.getEditCard = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(card.user, function (err, user) {
      var isMyCard = false;
      if (req.user) {
        isMyCard = card.user.equals(req.user._id);
      } else {
        req.session.returnTo = '/cards/' + req.params.card_id + '/edit';
        return res.redirect('/signin');
      }
      if (!err && isMyCard) {
        res.render("../views/pages/card_post", {
          docTitle: "Edit card  \u00B7 " + companyName, 
          pageTitle: "Edit Card",
          card: card
        });
      } else {
        return res.redirect('/cards/' + req.params.card_id);
      }
    });
  });
};

exports.postEditCard = function (req, res) {
  if (!req.user) {
    req.session.returnTo = '/post-card';
    return res.redirect('/signin');
  }
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(card.user, function (err, user) {
      var isMyCard = false;
      if (req.user) {
        isMyCard = card.user.equals(req.user._id);
      } else {
        req.session.returnTo = '/cards/' + req.params.card_id + '/edit';
        return res.redirect('/signin');
      }
      if (!err && isMyCard) {
        var imgUrl;
        if (req.files.image && req.files.image.size < 200000) {
          imgUrl = "/img/cards/" + req.files.image.name;
        } else {
          imgUrl = card.image;
        }

        card.title = req.body.title;
        card.description = req.body.description;
        card.attr.price = req.body.price;
        card.image = imgUrl;

        card.save(function (err) {
          if (err) {
            res.send(err);
          } else {
            res.redirect("/cards/" + card._id);
          }
        });
      }
    });
  });
};

exports.postCard = function (req, res) {
  if (!req.user) {
    return res.redirect('/signin');
  }
  var imgUrl;
  var card;

  if (req.files.image && req.files.image.size < 200000) {
    imgUrl = "/img/cards/" + req.files.image.name;
  } else {
    imgUrl = "/img/cards/default.png";
  }

  card = new Card({
    title: req.body.title,
    description : req.body.description,
    attr : {
      "price" : req.body.price
    },
    user: req.user._id,
    image: imgUrl
  });

  card.save(function (err) {
    if (err) {
      res.send(err);
    } else {
      res.redirect("/cards/" + card._id);
    }
  });
};

exports.getAllCards = function (req, res) {
  Card.find().populate('user').exec(function (err, cards) {
    if (!err) {    
      res.render("../views/pages/card_all", {
        docTitle: companyName + " \u00B7 " + tagline,
        pageTitle: "Discover Cards", 
        cards: cards,
      }); 
    } else {
      res.send(err);
    }
  });
};

exports.getCard = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(card.user, function (err, user) {
      var isMyCard = false;
      var isFavorite = false;
      if (req.user) {
        isMyCard = card.user.equals(req.user._id);
        isFavorite = req.user.favorites.indexOf(card._id) > -1;
      }
      if (!err) {
        res.render("../views/pages/card_single", {
          docTitle: card.title + " \u00B7 " + companyName,
          pageTitle: card.title, 
          card: card,
          user: user,
          isMyCard: isMyCard,
          isFavorite: isFavorite
        }); 
      } else {
        res.send(err);
      }  
    });
  });
}

exports.postDeleteCard = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    if (!req.user) {
      res.redirect("/cards/" + card._id);
    } else {
      if (card.user.equals(req.user._id)) {
        Card.remove({_id: req.params.card_id}, function(err, card) {
          if (err) {
            res.send(err);
          } else {               
            res.redirect("/" + req.user.username);
          }
        });
      } else {
        res.redirect("/cards/" + card._id);
      }
    }
  })
};

exports.postFavoriteCard = function (req, res) {
  Card.findById(req.params.card_id, function (err, card) {
    User.findById(req.user, function (err, user) {
      if (!err) {
        var isFavorite = req.user.favorites.indexOf(card._id) > -1;
        if (isFavorite) {
          card.attr.favorites -= 1;
          user.favorites.splice(card._id);
        } else if (!isFavorite) {
          card.attr.favorites += 1;
          user.favorites.push(card._id);
        }
        card.save(function (err) {
          user.save(function (err) {
            if (!err) {
              res.redirect("/cards/" + card._id);
            }
          })
        });
      } else {
        res.redirect("/cards/" + card._id);
      }
    });
  });
}

