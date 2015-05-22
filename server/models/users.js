var express = require('express'),
  router = express.Router()


module.exports = {
  githubAuth: function(req, res) {
    console.log(req.session)
    passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']});
  },

  herokuAuth: function() {
    passport.authenticate('heroku');
  },

  githubCallback: function() {
    passport.authenticate('github', { successRedirect: '/#/main', failureRedirect: '/' });
  },

  herokuCallback: function() {
    passport.authenticate('heroku', {successRedirect: '/#/deploy', failureRedirect: '/auth/heroku/fail' });
  },

  checkAuth: function(req, res) {
   res.status(200).json(req.isAuthenticated());
  }

}


router.get('/logout', function (req, res){
  req.session.destroy()
  req.logout();
  res.redirect('/');
})

