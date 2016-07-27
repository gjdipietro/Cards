'use strict';

module.exports = {
  db: process.env.MONGODB || 'mongodb://gregd:greg18@ds031271.mlab.com:31271/cards',

  sessionSecret: process.env.SESSION_SECRET || 'Your Session Secret goes here',

  facebook: {
    clientID: process.env.FACEBOOK_ID || '477937095689664',
    clientSecret: process.env.FACEBOOK_SECRET || 'f190398044cbcbe3d2b70977e10d4346',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY || 'egvaNbeTaOSCmyokIWynqaoVo',
    consumerSecret: process.env.TWITTER_SECRET  || 'q7a8Uf4NMYT7AkFeiyrqYp53KfHXmVqnZxyCoQuGpd4yhU4JNN',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },
};

