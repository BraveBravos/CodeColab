var files = require('../models/files.js');

module.exports = function (app) {

  app.get('/*', files.getContents);
  app.post('/*', files.updateRight);
};