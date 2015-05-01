var express = require('express'),
    bodyParser = require ('body-parser'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('./documents/documents.js'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810');

var session = require('express-session'),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy;

if (!process.env.CLIENT_ID) {
  var keys = require('./keys.js');
}


app.set('port', (process.env.PORT || 3000));
app.use(session({secret: 'oursecret'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./client'));

app.use(function (req, res, next) {
  req.db = db;
  next();
})

var sess;

app.get('/auth/github/callback', function (req, res, next) {
  if (req.session) {
    sess = req.session;
    console.log('//', sess)
  } else {
    console.log('no session')
  }
  next();
})

app.post('/api/documents', function (req, res){
    req.githubId = sess.githubId;
    docs.sendDoc(req);
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

passport.use(new GitHubStrategy({
    //once we save as environment var:
    clientID: process.env.CLIENT_ID || keys.clientID,
    clientSecret: process.env.CLIENT_SECRET || keys.clientSecret,
    // callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    callbackURL: "https://code-colab.herokuapp.com/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('inside gitHubStrategy')

    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   //store githubID (profile.id) in DB 
    //   return done(err, user);
    // });

    //store accessToken with user

    var collection = db.get('Users');
    collection.find({githubId: profile.id}, function(err, found){
      if (found.length > 0){ //if user exists
        console.log('user found: ', found);
        console.log('profile: ', profile)
        console.log('accessToken: ', accessToken)
        var user = found[0]
        return done(err, user)
      } else { //if user doesn't exist in db
        console.log('user not found')
        collection.insert({
          githubId: profile.id, accessToken: accessToken
        })
        .success(function(user){ done(err,user) }) //store their gitID
      }
      console.log('session', sess)
      console.log('done',done)
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
  passport.authenticate('github', {scope: []}) //insert scopes
);

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/signin' }),
  function(req, res) {
    console.log('inside redirect for /auth/github/callback')
    // Successful authentication, redirect home.
    // console.log(req.user)
    res.redirect('/main');
  }
);

// app.post('some endpoint',    //clone repo
//   function(req, res){
//     req.user
// })











