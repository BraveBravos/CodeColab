var repos = require('../models/repos.js');

module.exports = function (app) {

  app.get('/', repos.getRepos);
  app.get('/orgs', repos.getOrgs);
  app.post('/orgs', repos.getOrgRepos);
};