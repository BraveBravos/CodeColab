var express = require('express'),
  router = express.Router(),
  passport = require('passport'),
  GitHubStrategy = require('passport-github').Strategy,
  HerokuStrategy = require('passport-heroku').Strategy;
  if (!process.env.CLIENT_ID) var keys = require('../../keys.js');


 passport.serializeUser(function(user, done) {
    var users = db.get('Users');

    if (user.provider === 'github') {
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
    } else {//for Heroku OAuth
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
    }
  });

  passport.deserializeUser(function(id, done) {
    db.get('Users').find({_id: id}, function (err, user) {
      done(null, user[0]);
    });
  });

  passport.use(new GitHubStrategy({
      clientID: process.env.CLIENT_ID || keys.clientID,
      clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
      callbackURL: process.env.CALLBACK_URL || keys.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
      console.log('github strategy')
      req.session.token = accessToken;
      req.session.cookie.expires = new Date(Date.now() + 8*60*60*1000)

      return done(null, profile)
    }
  ));

  passport.use(new HerokuStrategy({
    clientID: process.env.HEROKU_CLIENT_ID || keys.herokuId,
    clientSecret: process.env.HEROKU_CLIENT_SECRET || keys.herokuSecret,
    callbackURL: process.env.HEROKU_CALLBACK || keys.herokuCallback,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    req.session.herokuToken = accessToken;
    profile.codeColabId = req.user._id;
    return done(null, profile);
  }));


module.exports = {
  githubAuth: function() {
    console.log('github auth')
    passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']});
  },

  herokuAuth: function() {
    passport.authenticate('heroku', {session: false});
  },

  githubCallback: function() {
    console.log('github callback')
    passport.authenticate('github', { successRedirect: '/#/main', failureRedirect: '/' });
  },

  herokuCallback: function() {
    passport.authenticate('heroku', {successRedirect: '/#/deploy', failureRedirect: '/auth/heroku/fail' });
  },

  checkAuth: function(req, res) {
   res.status(200).json(req.isAuthenticated());
  }

}



