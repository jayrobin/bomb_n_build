var express = require('express');
var app = express();
var http = require('http').Server(app);

var PORT = 3002;
var PUBLIC_DIR = __dirname + '/public';

app.get('/', function(req, res) {
  res.sendFile(PUBLIC_DIR + '/index.html');
})

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
})