const world = require('./world');

function Client(id, socket, io) {
  this.id = id;
  this.socket = socket;
  this.io = io;
  console.log(`Client connected: ${this.id}`);
  this.initialize();
}

Client.prototype.initialize = function() {
  this.setupListeners();
  this.socket.emit('register_id', this.id);
  this.setInitialPos(world.getRandomPos());
  this.socket.emit('current_players', world.getClientPositions());
  this.socket.emit('current_bombs', world.getBombPositions());
};

Client.prototype.setupListeners = function() {
  this.socket.on('disconnect', this.handleDisconnection.bind(this));
  this.socket.on('update_input', this.handleUpdateInput.bind(this));
  this.socket.on('drop_bomb', this.handleDropBomb.bind(this));
};

Client.prototype.handleDisconnection = function() {
  console.log(`Client disconnected ${this.id}`);
  world.removeClient(this.id);
  this.socket.broadcast.emit('remove_player', this.id);
};

Client.prototype.setInitialPos = function(pos) {
  this.pos = pos;
  this.socket.emit('set_initial_pos', this.pos);
  this.socket.broadcast.emit('add_player', this.id, this.pos);
};

Client.prototype.handleUpdateInput = function(input, pos) {
  this.pos = pos;
  this.socket.broadcast.emit('update_input', this.id, input);
};

Client.prototype.handleDropBomb = function(pos) {
  var bomb = world.addBomb(pos.x, pos.y);
  console.log(`Bomb dropped at ${bomb.pos.x}, ${bomb.pos.y}`);
  this.io.emit('drop_bomb', bomb.id, bomb.pos);
};

module.exports = Client;
