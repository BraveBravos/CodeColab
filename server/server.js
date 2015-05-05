var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    fileStruct = require('./fileStruct.js'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require ('connect-mongo')(session),
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
    request = require('request'),
    sess;


if (!process.env.CLIENT_ID) {
  var keys = require('../keys.js');
}


app.set('port', (process.env.PORT || 3000));
app.use(express.static('./client'));
app.use(express.static(sharejs.scriptsDir));
app.use(express.static(shareCodeMirror.scriptsDir));

app.use(bodyParser.json());
app.use (cookieParser());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'oursecret',
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({url: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'})
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  req.db = db;
  next();
})

app.get('/auth/github/callback', function (req, res, next) {
  // console.log('callback: ',req.session)
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


app.listen(app.get('port'), function() {
  console.log('Node app running on port', app.get('port'));
});

passport.serializeUser(function(user, done) {
  console.log('user', user)
  db.get('Users').find({githubId: user.id}, function (err, result) {
    if(result.length === 0){
      //User isn't in the database yet (FIRST TIMER!)
      //Insert data is the first thing stored for users
      var insertData = [{githubId: user.id, username: user.username}]
      db.get('Users').insert(insertData);
    } else {
      //User is already in the database, just return their data
      done(null, result);
    }
  });
});

passport.deserializeUser(function(obj, done) {
  db.get('Users').find({githubId: obj.id}, function (err, result) {
    done(null, obj);
  });
});

passport.use(new GitHubStrategy({
    clientID: process.env.CLIENT_ID || keys.clientID,
    clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
    callbackURL: process.env.CALLBACK_URL || keys.callbackURL,
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    return done(null, profile)
      }
));


app.get('/api/repos', function (req, res) {
  //when do we get users?
  //return githubID
  // console.log('test: ',req)
  console.log('requested',req.session.passport.user)

  // var q = http.get({
  //   host: 'api.github.com',
  //   path: '/users/'+req.session.passport.user.username+'/repos',
  //   headers: {'User-Agent': req.session.passport.user.username}
  // }, function(resp) {
  //   console.log('body')
  //   var body = ''
  //   resp.on('data', function(d) {
  //     console.log('data')
  //     body+=d
  //   })
  //   resp.on('end', function() {
  //     console.log('end')
  //     // return body
  //   })
  // })
  // console.log(q)
  var q;
  request({
    url: 'https://api.github.com/users/'+req.session.passport.user.username+'/repos',
    headers: {'User-Agent': req.session.passport.user.username},
    token: '0c46f2a25b54716fcc4bd1993d40085da7c5114c'
  },
  function(err,resp,body) {
    console.log('returned',body)
    q = body
    // res.json(body)
    // console.log('resp',q)
  })
  console.log('q',q)
  res.json(q)

  // http.get('https://api.github.com/users/'+req.session.passport.user.username+'/repos', function(req, res) {
  //   return res
  // })
  // console.log('users: ',req.session.passport.user.username)
  // res.status(200).json(req.session.githubId);
})
app.get('/auth/github',
  passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']})
);

app.get('/auth/github/callback', passport.authenticate(
  'github', { successRedirect: '/#/main', failureRedirect: '/' }
));

app.get('/api/auth', function(req, res){
  res.status(200).json(req.isAuthenticated());
})
app.get('/test', function(req, res){
  res.status(200).json({
    isAuth: req.isAuthenticated(),
    user: req.user || 'none'
  });
})

app.get('/logout', function (req, res){
  //req.session.destroy()
  req.logout();
  res.redirect('/');
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






