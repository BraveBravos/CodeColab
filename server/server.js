var express = require('express');
var bodyParser = require ('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));
// app.use(express.static(__dirname + '/../client/'));
app.use(express.static('./client'));
app.use(bodyParser.json());
// app.get('/', function(request, response) {
// 	// console.log(__dirname) going to server folder
//   response.sendFile('public/index.html', {
//   	root: __dirname + '/../client/'
//   });
// });

require ('./middleware.js', app, express)

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
