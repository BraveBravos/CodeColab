if (!process.env.CLIENT_ID) var keys = require('../keys.js');

var express = require('express');
    app = express(),
    server  = require('http').createServer(app),
    browserChannel = require('browserchannel').server,
    mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk(process.env.MONGOLAB_URI || keys.dbAddress),
    bodyParser = require ('body-parser'),
    Duplex = require( 'stream' ).Duplex,
    livedb = require( 'livedb' ),
    sharejs = require( 'share' ),
    liveDBMongoClient = require('livedb-mongo'),
    dbClient =liveDBMongoClient(process.env.MONGOLAB_URI || keys.dbAddress,
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    });

require('./config/express')(app);
require('./auth')(app);
require('./routes')(app);
app.use('browserChannel', require('./models/browserChannel.js'));



app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() { console.log('Node app running on port', app.get('port')) });


app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
})

app.use(browserChannel(function(client) {
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



