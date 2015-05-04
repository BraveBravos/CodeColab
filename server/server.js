var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    fileStruct = require('./fileStruct.js'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810');

var session = require('express-session'),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    livedb = require( 'livedb' ),
    Duplex = require( 'stream' ).Duplex,
    browserChannel = require('browserchannel').server,
    sharejs = require( 'share' ),
    shareCodeMirror = require( 'share-codemirror' ),
    http    = require( 'http' ),
    server  = http.createServer( app ),
    liveDBMongoClient = require('livedb-mongo'),
    dbClient =liveDBMongoClient('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    }),
    sess;


if (!process.env.CLIENT_ID) {
  var keys = require('../keys.js');
}


app.set('port', (process.env.PORT || 3000));
app.use(express.static('./client'));
app.use(express.static(sharejs.scriptsDir));
app.use(express.static(shareCodeMirror.scriptsDir));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'oursecret',
  saveUninitialized: true,
  resave: true,
  store: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  req.db = db;
  next();
})

app.get('/auth/github/callback', function (req, res, next) {
  if (req.session) {
    sess = req.session;
  } else {
    console.log('no session')
  }
  next();
})


app.get('/api/fileStruct', function (req, res){
  // req.
})

app.get('/api/users', function (req, res) {
  res.status(200).json(sess.githubId);
})

app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});

// app.listen(3000, function() {
//   console.log('Node app running on port', 3000);
// });

// server.listen(port)
// console.log('Node app running on port',port)

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID || keys.clientID,
    clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
    callbackURL: process.env.CALLBACK_URL || keys.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    var collection = db.get('Users');
    collection.find({githubId: profile.id}, function(err, found){
      if (found.length > 0){
        var user = found[0];
        sess.githubId = user.githubId;
        sess.username = user.username;
      } else {
        console.log('user not found')
        collection.insert({
          githubId: profile.id,
          username: profile.username
        })
        sess.githubId  = profile.id;
        sess.username = profile.username;
      }
      passport.serializeUser(function(user, done) {
        done(null, user);
      });
      passport.deserializeUser(function(user, done) {
        done(null, user);
      });
      return done(err, user)
    })
  }
));


app.get('/auth/github',
  passport.authenticate('github', {scope: ['repo', 'user']})
);

app.get('/auth/github/callback', passport.authenticate(
  'github', { successRedirect: '/#/main',
    failureRedirect: '/#/signin' }
));

app.get('/api/auth', function(req, res){
  res.status(200).json(req.isAuthenticated());
})

app.get('/logout', function (req, res){
  req.session.destroy();
  res.sendStatus(200);
})

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






