var files = require('../models/files.js');

module.exports = function (app) {


  app.post('/newFile', files.addFile);
  app.post('/deleteFile', files.deleteFile);
  app.get('/*', files.getContents);
  app.post('/*', files.updateRight);
};