
var express = require('express');
    app = express(),
    server  = require('http').createServer(app),
    bodyParser = require ('body-parser');

require('./config/express')(app);
require('./auth')(app);
require('./routes')(app);
require('./models/browserChannel')(app);



app.set('port', (process.env.PORT || 3000));
app.listen(app.get('port'), function() { console.log('Node app running on port', app.get('port')) });


app.get('/logout', function (req, res){
  req.logout();
  res.redirect('/');
})



exports =module.exports=app;



