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


app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./client'));

app.use(function (req, res, next) {
  req.db = db;
  next();
})

app.use(session({secret: 'oursecret'}));
var sess;

app.get('/', function (req, res, next) {
  if (req.session) {
    sess = req.session;
    console.log('//', sess)
  } else {
    console.log('no session')
  }
  next();
})

app.post('/api/documents', function (req, res){
    docs.sendDoc(req);
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

passport.use(new GitHubStrategy({
    //once we save as environment var:
    // clientID: process.env.GITHUB_CLIENT_ID,
    // clientSecret: process.env.GITHUB_CLIENT_SECRET,
    clientID: 'b127ac98c63ddde943a4',
    clientSecret: '3d1734cea8816504187c53db26ef8530bab85c7f',
    callbackURL: "http://127.0.0.1:3000/main"
    // callbackURL: "https://code-colab.herokuapp.com/#/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('access', accessToken, 'refresh', refreshToken, 'profile', profile)

    // User.findOrCreate({ githubId: profile.id }, function (err, user) {
    //   //store githubID (profile.id) in DB
    //   return done(err, user);
    // });
    sess.token = accessToken;
    console.log('sess', sess.token)
    var collection = db.get('Users');
    collection.find({githubId: profile.id}, function(err, found){
      if (found.length > 0){ //if user exists
        console.log('user found: ', found);
        console.log('profile: ', profile)
        var user = found[0]
        return done(err, user)
      } else { //if user doesn't exist in db
        console.log('user not found')
        collection.insert({
          githubId: profile.id
        } ) //store their gitID
      }
    })

    //db.close()   // ?

    //send back to client ?
    // app.get('/signin', function(req, res) {
    //   res.send(profile.id);
    // });
  }
));


app.get('/auth/github',
  passport.authenticate('github')
);

app.get('/auth/github/callback',
  passport.authenticate('github', { successRedirect: '/main', failureRedirect: '/signin' }),
  function(req, res) {
    console.log('response', res)
    // Successful authentication, redirect home.
    res.redirect('/main');
  }
);







