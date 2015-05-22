var express = require('express');
var app = express();
var server  = require('http').createServer(app);
var  browserChannel = require('browserchannel').server;
var mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    bodyParser = require ('body-parser');

require('./config/express')(app);
require('./routes.js')(app)

app.use(function (req, res, next) {
  req.db = db;
  next();
})


app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});


app.use(browserChannel( function(client) {
  var stream = new Duplex({objectMode: true});

  stream._read = function() {};
  stream._write = function(chunk, encoding, callback) {
    if (client.state !== 'closed') {
      client.send(chunk);
    }
    callback();
  };

  client.on('message', function(data) {
    stream.push(data);
  });

  client.on('close', function(reason) {
    stream.push(null);
    stream.emit('close');
  });

  stream.on('end', function() {
    client.close();
  });

  return share.listen(stream);

}));


exports =module.exports=app;



