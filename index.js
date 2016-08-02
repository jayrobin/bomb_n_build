const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const world = require('./game/world');
const Client = require('./game/client');
const clients = [];

const PORT = process.env.PORT || 3001;
const TICK_DELAY = 100;
const MAP_FILE = './game/map.txt';

fs.readFile(MAP_FILE, 'utf8', (err, mapData) => {
  world.buildMap(mapData);
  world.setServer(io);
  start();
});

function start() {
  app.use(express.static('public'));

  app.get('/', (req, res) => {
    res.sendFile('index.html');
  });

  io.on('connection', handleConnection);

  http.listen(PORT, () => {
    console.log(`Server initialized on port: ${PORT}`);
  });

  setInterval(world.tick.bind(world), TICK_DELAY);
}

function handleConnection(socket) {
  world.addClient(new Client(socket.id, socket, io));
}
