if (!process.env.CLIENT_ID) {
  var keys = require('../../keys.js');
  }

var mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk(process.env.MONGOLAB_URI || keys.dbAddress);


module.exports = {


  serializeGithub: function(user, done) {
    var users = db.get('Users');
    users.find({githubId: user.id}, function (err, result) {
      if(result === undefined || result.length === 0){ //User isn't in DB (FIRST TIMER!)
        var insertData = [{githubId: user.id, username: user.username, apps: {}}],
            promise = users.insert(insertData);

        promise.success(function(doc) {
          done(null, doc[0]._id);
        })
      } else { //User is already in DB, just return their data
        done(null, result[0]._id);
      }
    });
  },

  serializeHeroku: function(user, done) {
    var users = db.get('Users');
    users.find({herokuId: user.id}, function (err, result) {
      if(result.length === 0){ //User hasn't authorized heroku yet
        users.find({_id: user.codeColabId}, function (err, result) {
          users.update(result[0]._id,
            {$set:
              {herokuId: user.id}
            },
            function (err) {
              if (err) console.log('error adding heroku token');
            });
        done(null, result[0]._id);
        });
      } else { //Heroku ID is already in DB, just return their data
        done(null, result[0]._id);
      }
    });
  },

  deserialize: function(id, done) {
    db.get('Users').find({_id: id}, function (err, user) {
        done(null, user[0]);
      });
  }
}



