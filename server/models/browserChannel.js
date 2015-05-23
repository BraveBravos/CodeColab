if (!process.env.CLIENT_ID) var keys = require('../../keys.js');


var browserChannel = require('browserchannel').server,
    mongo = require('mongodb'),
    monk =require ('monk'),
    db = monk(process.env.MONGOLAB_URI || keys.dbAddress),
    Duplex = require( 'stream' ).Duplex,
    sharejs = require( 'share' ),
    livedb = require( 'livedb' )
    liveDBMongoClient = require('livedb-mongo'),
    dbClient =liveDBMongoClient(process.env.MONGOLAB_URI || keys.dbAddress,
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    });



module.exports = function(app) {

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
}