const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const world = require('./game/world');
world.setServer(io);
const Client = require('./game/client');
const clients = [];

const PORT = 3001;
const TICK_DELAY = 100;

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.sendFile('index.html');
});

io.on('connection', handleConnection);

http.listen(PORT, function() {
  console.log('Server initialized on port: ' + PORT);
});

setInterval(world.tick.bind(world), TICK_DELAY);

function handleConnection(socket) {
  world.addClient(new Client(socket.id, socket, io));
}
