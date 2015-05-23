var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    app = express(),
     cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require ('connect-mongo')(session),
    path = require('path'),
    passport = require('passport'),
    http    = require( 'http' ),
    sharejs = require( 'share' ),
    shareCodeMirror = require( 'share-codemirror' );





    module.exports = function(app) {
    app.use(express.static('./client'));
    app.use(express.static(sharejs.scriptsDir));
    app.use(express.static(shareCodeMirror.scriptsDir));

    app.use(bodyParser.json());
    app.use (cookieParser());
    app.use(bodyParser.urlencoded({extended: true,limit: 1000000}));
    app.use(session({
      secret: 'oursecret',
      saveUninitialized: false,
      resave: false,
      store: new MongoStore({
        url: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
        ttl: 60*60*8,
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // app.use(function cleanupPassportSession(req, res, next){
    //     // hook me in right AFTER express-session
    //     onHeaders(res, function()
    //     {
    //         if (Object.keys(req.session.passport).length === 0)
    //         {
    //             delete req.session.passport;
    //         }
    //     });

    //     next();
    // });

    }