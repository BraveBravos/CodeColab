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
app.use(bodyParser.urlencoded({extended: true}));
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
    req.session.token = accessToken;
    req.session.userID = profile.id
    req.session.username = profile.username;
    return done(null, profile)
      }
));


app.get('/api/repos', function (req, res) {
  request({
    url: 'https://api.github.com/user/repos?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.session.passport.user[0].username}
  },
  function(err,resp,body) {
    var data = JSON.parse(body).map(function (repo) {
      return {name: repo.full_name, id: repo.id};
    })
      res.status(200).json(data)
  });
});

app.get('/api/orgs', function (req, res) {
  request({
    url: 'https://api.github.com/user/orgs?access_token='+ req.session.token+ '&type=all',
    headers: {'User-Agent': req.session.passport.user[0].username}
  },
  function (err, resp, body) {
    var orgList = JSON.parse(body).map(function (org) {
      return org.login;
    })
    res.status(200).json(orgList);
  });

});

app.post ('/api/orgs/repos', function (req, res) {
  var org = req.body.org;
  console.log('org', org)
  request({
    url: 'https://api.github.com/orgs/'+ org+ '/repos?access_token='+ req.session.token,
    headers: {'User-Agent': req.session.passport.user[0].username}
  },
    function (err, resp, body) {
      var data = JSON.parse(body).map(function (repo) {
        return {name: repo.full_name, id: repo.id};
      });
      res.status(200).json(data)
    });
});

app.get('/auth/github',
  passport.authenticate('github', {scope: ['repo', 'user', 'admin:public_key']})
);

app.get('/auth/github/callback', passport.authenticate(
  'github', { successRedirect: '/#/main', failureRedirect: '/' }
));

app.get('/api/auth', function(req, res){
  res.status(200).json(req.isAuthenticated());
})
// app.get('/test', function(req, res){
//   res.status(200).json({
//     isAuth: req.isAuthenticated(),
//     user: req.user || 'none'
//   });
// })

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






