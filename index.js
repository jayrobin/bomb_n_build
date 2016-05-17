var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var world = require('./game/world');

var PORT = 3001;

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

io.on('connection', handleConnection);

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
});

function handleConnection(client) {
  client.emit('register_id', client.id);
  console.log('User connected: ' + client.id);
}
