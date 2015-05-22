module.exports = function(client) {

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
}