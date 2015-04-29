var express = require('express');
var bodyParser = require ('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));
app.use(express.static('./client'));
app.use(bodyParser.json());


require ('./middleware.js', app, express)

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


