const world = require('./world');

const BOMB_DROP_DELAY = 1000;

function Client(id, socket, io) {
  this.id = id;
  this.socket = socket;
  this.io = io;
  this.active = false;
  console.log(`Client connected: ${this.id}`);
  this.initialize();
}

Client.prototype.initialize = function() {
  this.setupListeners();
  this.socket.emit('register_id', this.id);
  this.socket.emit('map_state', world.getMapData());
  this.setInitialPos(world.getRandomPos());
  this.socket.emit('current_players', world.getClientPositions());
  this.socket.emit('current_bombs', world.getBombPositions());
  this.socket.emit('current_building_tiles', world.getBuilders());
  this.bombDropTimer = 0;
  this.active = true;
};

Client.prototype.setupListeners = function() {
  this.socket.on('disconnect', this.handleDisconnection.bind(this));
  this.socket.on('update_input', this.handleUpdateInput.bind(this));
  this.socket.on('drop_bomb', this.handleDropBomb.bind(this));
  this.socket.on('respawn', this.handleRespawn.bind(this));
  this.socket.on('start_building', this.handleStartBuilding.bind(this));
  this.socket.on('stop_building', this.handleStopBuilding.bind(this));
};

Client.prototype.handleRespawn = function() {
  var pos = world.getRandomPos();
  this.pos = pos;
  this.io.emit('player_respawn', this.id, this.pos);
};

Client.prototype.handleStartBuilding = function(pos, direction) {
  var gridPos = world.coordsToGridPos(pos);
  gridPos.x += direction.x;
  gridPos.y += direction.y;

  if (this.buildingTile) {
    var gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
  }

  this.buildingTile = world.getTile(gridPos.x, gridPos.y);
  world.startBuilding(gridPos.x, gridPos.y);
};

Client.prototype.handleStopBuilding = function(pos, direction) {
  if (!this.buildingTile) {
    var gridPos = world.coordsToGridPos(pos);
    gridPos.x += direction.x;
    gridPos.y += direction.y;
    world.stopBuilding(gridPos.x, gridPos.y);
  } else {
    var gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
    this.buildingTile = null;
  }
};

Client.prototype.handleDisconnection = function() {
  console.log(`Client disconnected ${this.id}`);
  world.removeClient(this.id);
  this.socket.broadcast.emit('remove_player', this.id);

  if (this.buildingTile) {
    var gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
    this.buildingTile = null;
  }
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
  if (this.bombDropTimer === 0) {
    var bomb = world.addBomb(this, pos.x, pos.y);
    if (bomb) {
      console.log(`Bomb dropped at ${bomb.pos.x}, ${bomb.pos.y}`);
      this.io.emit('drop_bomb', bomb.id, bomb.pos);
      this.bombDropTimer = BOMB_DROP_DELAY;
    }
  }
};

Client.prototype.update = function() {
  if (this.active) {
    this.tickBombDropTimer();
    if (!!this.buildingTile) {
      this.buildingTile.update();
    }
  }
};

Client.prototype.tickBombDropTimer = function() {
  if (this.bombDropTimer > 0) {
    this.bombDropTimer = Math.max(this.bombDropTimer - world.getElapsed(), 0);
  }
};

module.exports = Client;
