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



if (!process.env.CLIENT_ID) {
  var keys = require('../../keys.js');
  }

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
        url: process.env.MONGOLAB_URI || keys.dbAddress,
        ttl: 60*60*8,
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    }