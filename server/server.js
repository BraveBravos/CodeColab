var express = require('express');
var bodyParser = require ('body-parser');
var app = express();
var mongo = require('mongodb');
var monk =require ('monk');
var db = monk('mongodb://heroku_app36344810:slkuae58qandst6sk9r58r57bl@ds031812.mongolab.com:31812/heroku_app36344810');

app.set('port', (process.env.PORT || 3000));
app.use(express.static('./client'));
app.use(bodyParser.json());


require ('./middleware.js', app, express)

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
