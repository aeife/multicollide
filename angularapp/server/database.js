'use strict';

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/multicollide');

mongoose.connection.on('error', function(err) {
  console.error('MongoDB error: %s', err);
});
mongoose.connection.on('index',function(err) {
  console.error('MongoDB error: %s', err);
});
mongoose.set('debug', true);

var userSchema = mongoose.Schema({
  name: {type: String, index: {unique: true}},
  password: String,
  email: String,
  language: {type: String, default: 'en-US'},
  games: {type: Number, default: 0},
  won: {type: Number, default: 0},
  score: {type: Number, default: 0},
  friends: [String],
  requests: [String]
});
userSchema.set('autoIndex', true);
var User = mongoose.model('User', userSchema);

module.exports.User = User;
