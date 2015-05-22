 var express = require('express'),
    connect = require('connect'),
    bodyParser = require ('body-parser'),
    atob = require('atob'),
    btoa = require('btoa'),
    app = express(),
    mongo = require('mongodb'),
    monk =require ('monk'),
    docs = require('../documents/documents.js'),
    fileStruct = require('../fileStruct.js'),
    db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require ('connect-mongo')(session),
    path = require('path'),
    passport = require('passport'),
    GitHubStrategy = require('passport-github').Strategy,
    HerokuStrategy = require('passport-heroku').Strategy,
    livedb = require( 'livedb' ),
    Duplex = require( 'stream' ).Duplex,
    browserChannel = require('browserchannel').server,
    sharejs = require( 'share' ),
    shareCodeMirror = require( 'share-codemirror' ),
    http    = require( 'http' ),
    liveDBMongoClient = require('livedb-mongo'),
    dbClient =liveDBMongoClient('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
      {safe: true}),
    backend = livedb.client(dbClient),
    share = sharejs.server.createClient({
      backend: backend
    }),
    request = require('request'),
    bcrypt = require('bcrypt');

    module.exports = function(app) {
     app.use(express.static('./client'));
    app.use(express.static(sharejs.scriptsDir));
    app.use(express.static(shareCodeMirror.scriptsDir));
    app.use(require('./models'));

    app.use(bodyParser.json());
    app.use (cookieParser());
    app.use(bodyParser.urlencoded({extended: true,limit: 1000000}));
    app.use(session({
      secret: 'oursecret',
      saveUninitialized: true,
      resave: true,
      store: new MongoStore({
        url: 'mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810',
        ttl: 60*60*8,
        })
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    }