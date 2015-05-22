var express = require('express');
var app = express();
var server  = require('http').createServer(app);
var  browserChannel = require('browserchannel').server;
var mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    bodyParser = require ('body-parser'),
    passport = require('passport'),
    oauth = require('./passport.js'),
    GitHubStrategy = require('passport-github').Strategy,
 HerokuStrategy = require('passport-heroku').Strategy;

require('./config/express')(app);
require('./routes.js')(app)
require('./browserChannel.js')(client)

app.use(function (req, res, next) {
  req.db = db;
  next();
})
if (!process.env.CLIENT_ID) {
  var keys = require('../keys.js');
  }


app.get('/auth/github',
  passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']})
);

app.get('/auth/github/callback', passport.authenticate(
  'github', { successRedirect: '/#/main', failureRedirect: '/' }
));


app.get('/auth/heroku', passport.authenticate('heroku'));

app.get('/auth/heroku/callback',
  passport.authenticate('heroku', {successRedirect: '/#/deploy', failureRedirect: '/auth/heroku/fail' })
);
app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});

  passport.serializeUser(function(user, done) {
    var users = db.get('Users');
    console.log(user)
    console.log('db',users)

    if (user.provider === 'github') {
      users.find({githubId: user.id}, function (err, result) {
        console.log('result', result, 'err', err, 'length', result.length)
        if(result === undefined || result.length === 0){ //User isn't in DB (FIRST TIMER!)
          var insertData = [{githubId: user.id, username: user.username, apps: {}}]
          var promise = users.insert(insertData);
          promise.success(function(doc) {
            done(null, doc[0]._id);
          })
        } else { //User is already in DB, just return their data
          console.log('after result',result)
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
      console.log('strategy')
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




exports =module.exports=app;



