var express = require('express');
var bodyParser  = require('body-parser');

module.exports = function (app) {
  var userRouter = express.Router();
  var repoRouter = express.Router();
  var fileRouter = express.Router();
  var buildRouter = express.Router();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  app.use('/auth', userRouter);

  app.use('/api/repos', repoRouter);
  app.use('/api/files', fileRouter);
  app.use('/api/builds', buildRouter);

  require('./routers/userRouter.js')(userRouter);
  require('./routers/repoRouter.js')(repoRouter);
  require('./routers/fileRouter.js')(fileRouter)
  require('./routers/buildRouter.js')(buildRouter)
};

