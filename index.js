const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const world = require('./game/world');

const PORT = 3001;

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
  client.emit('set_pos', world.getRandomPos());
  console.log('User connected: ' + client.id);
}
