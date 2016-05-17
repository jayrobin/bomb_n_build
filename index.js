var express = require('express');
var app = express();
var http = require('http').Server(app);

var PORT = 3002;

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
})

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
})