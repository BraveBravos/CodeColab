
var passport = require('passport'),
  GitHubStrategy = require('passport-github').Strategy,
  HerokuStrategy = require('passport-heroku').Strategy,
  Users = require('./models/users');

if (!process.env.CLIENT_ID) var keys = require('../keys.js');


 passport.serializeUser(function(user, done) {
    if (user.provider === 'github') {
      Users.serializeGithub(user,done);
    } else {
      Users.serializeHeroku(user, done);
    }
  });

  passport.deserializeUser(function(id, done) {
    Users.deserialize(id, done);
  });

  passport.use(new GitHubStrategy({
      clientID: process.env.CLIENT_ID || keys.clientID,
      clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
      callbackURL: process.env.CALLBACK_URL || keys.callbackURL,
      passReqToCallback: true
    },
    function(req, accessToken, refreshToken, profile, done) {
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



module.exports = function (app) {

  app.get('/auth/github',
    passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']})
  );

  app.get('/auth/github/callback', passport.authenticate(
    'github', { successRedirect: '/#/main', failureRedirect: '/' }
  ));


  app.get('/auth/heroku', passport.authenticate('heroku', {session: false}));

  app.get('/auth/heroku/callback',
    passport.authenticate('heroku', {successRedirect: '/#/deploy', failureRedirect: '/auth/heroku/fail' })
  );

  app.get('/auth/check', function(req, res) {
     res.status(200).json(req.isAuthenticated());
    })


}
