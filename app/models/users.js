var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  email: { 
    type: String, 
    unique: true, 
    lowercase: true,
    required: true
  },
  username_display: {
    type: String, 
    unique: true, 
    lowercase: true,
  },
  username: {
    type: String, 
    unique: true, 
    lowercase: true,
    required: true
  },
  password: String,
  facebook: String,
  twitter: String,
  google: String,
  tokens: Array,
  profile: {
    name: {type: String, default: ""},
    bio: {type: String, default: ""},
    location: {type: String, default: ""},
    website: {type: String, default: ""},
    picture: {type: String, default: ""}
  },
  created: { 
    type: Date, 
    default: Date.now() 
  },
  powerUser: { 
    type: Boolean,
    default: false
  },
  favorites: {
    type: Array,
  },
  cart: {
    type: Array,
  },
  orders: {
    type: Array,
  }

});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function(next) {
  var user = this;
  user.username_display = user.username
  user.username = string_to_slug(user.username);

  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size) {
  if (!size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

function string_to_slug(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  
  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i = 0, l = from.length ; i < l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}

module.exports = mongoose.model("User", userSchema);

