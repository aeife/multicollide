var assert = require('assert');
var database = require('../database');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/multicollide_test');

describe('User', function(){
  var currentUser = null;

  beforeEach(function(done){
    //delete all the customer records
    database.User.remove({}, function() {
      done();
    });

    currentUser = new database.User({name: 'testname', password: 'testpassword', email: 'testemail'});
    currentUser.save(function (err, user) {
      var error = null;
      if (err) {
        console.log(err);
        if (err.code === 11000) {
          error = 'duplicate name';
        }
      }
    });
  });

  afterEach(function(done){
    //delete all the customer records
    database.User.remove({}, function() {
      done();
    });
  });

  it("should save without error", function(done){
    var user = new database.User({name: 'testname1', password: 'testpassword1', email: 'testemail1'});
    user.save(done);
  });
});
