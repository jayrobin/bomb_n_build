const world = require('./world');

function Client(id, socket, io) {
  this.id = id;
  this.socket = socket;
  this.io = io;
  console.log('Client connected: ' + this.id);
  this.initialize();
}

Client.prototype.initialize = function() {
  this.setupListeners();
  this.socket.emit('register_id', this.id);
  this.socket.emit('set_pos', world.getRandomPos());
}

Client.prototype.setupListeners = function() {
  this.socket.on('disconnect', this.handleDisconnection.bind(this));
}

Client.prototype.handleDisconnection = function() {
  console.log('Client disconnected');
}

module.exports = Client;