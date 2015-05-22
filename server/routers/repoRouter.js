var repos = require('../models/repos.js');

module.exports = function (app) {

  app.get('/', repos.getRepos);
  app.put('/', repos.makeCommit);
  app.get('/orgs', repos.getOrgs);
  app.post('/orgs', repos.getOrgRepos);
  app.get('/branches/*', repos.getBranch);
  app.get('/tree/*', repos.getTree);
  app.put('/branches', repos.mergeBranch);
  app.post('/branches', repos.createBranch);
};