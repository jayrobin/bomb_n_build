var express = require('express');
var app = express();
var http = require('http').Server(app);

var PORT = 3002;

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
});