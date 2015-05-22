var user = require('../models/users.js');

module.exports = function (app) {

  app.get('/github', user.githubAuth);
  app.get('/heroku', user.herokuAuth);
  app.get('/check', user.checkAuth);
};