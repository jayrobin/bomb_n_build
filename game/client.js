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
  this.setPos(world.getRandomPos());
  this.joinWorld();
};

Client.prototype.setupListeners = function() {
  this.socket.on('disconnect', this.handleDisconnection.bind(this));
};

Client.prototype.handleDisconnection = function() {
  world.removeClient(this.id);
  console.log('Client disconnected');
};

Client.prototype.joinWorld = function() {
  this.socket.broadcast.emit('add_player', this.id, this.getPos());
};

Client.prototype.setPos = function(pos) {
  this.pos = pos;
  this.socket.emit('set_pos', this.pos);
};

Client.prototype.getPos = function() {
  return this.pos;
};

module.exports = Client;
