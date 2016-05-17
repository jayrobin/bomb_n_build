var express = require('express');
var app = express();
var http = require('http').Server(app);

var PORT = 3002;

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
})