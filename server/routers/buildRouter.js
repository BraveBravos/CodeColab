var builds = require('../models/builds.js');

module.exports = function (app) {

  app.post('/deploy', builds.deployApp);
  app.get('/deploy/*', builds.showLog);
  app.get('/*', builds.checkForApp);
  app.post('/*', builds.rebuild);
};