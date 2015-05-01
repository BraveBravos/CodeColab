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
app.use(express.static('./client'));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  req.db = db;
  next();
})

app.post('/api/documents', function (req, res){
    console.log('req', req.body)
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
    // callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    callbackURL: "https://code-colab.herokuapp.com/#/auth/github/callback"
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











