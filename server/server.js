var express = require('express'),
    bodyParser = require ('body-parser'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810');

var session = require('express-session'),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

if (!process.env.CLIENT_ID) {
  var keys = require('../keys.js');
}


app.set('port', (process.env.PORT || 3000));
app.use(session({secret: 'oursecret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./client'));

app.use(function (req, res, next) {
  req.db = db;
  next();
})

var sess;

app.get('/auth/github/callback', function (req, res, next) {
  if (req.session) {
    sess = req.session;
  } else {
    console.log('no session')
  }
  next();
})

app.post('/api/documents', function (req, res){
  req.githubId = sess.githubId;
  docs.sendDoc(req);
})

app.get('/api/documents', function (req, res) {
  req.githubId = sess.githubId;
  docs.getDoc(req, function (results) {
    console.log('response', results)
    res.status(200).send(results);
  });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID || keys.clientID,
    clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
    callbackURL: process.env.CALLBACK_URL || keys.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    var collection = db.get('Users');
    collection.find({githubId: profile.id}, function(err, found){
      if (found.length > 0){
          var user = found[0]
        sess.githubId = user.githubId;
        sess.username = user.username;
      } else {
        console.log('user not found')
        collection.insert({
          githubId: profile.id,
          username: profile.username
        })
        sess.githubId  = profile.id;
        sess.username = profile.username;
      }
      passport.serializeUser(function(user, done) {
        done(null, user);
      });
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });
      return done(err, user)
    })
  }
));


app.get('/auth/github',
  passport.authenticate('github', {scope: 'repo'})
);

app.get('/auth/github/callback', passport.authenticate('github', { successRedirect: '/#/main', failureRedirect: '/#/signin' }));







