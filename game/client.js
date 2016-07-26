'use strict';

const world = require('./world');

const MAX_BOMBS = 2;

function Client(id, socket, io) {
  this.id = id;
  this.socket = socket;
  this.io = io;
  this.active = false;
  this.bombs = [];
  console.log(`Client connected: ${this.id}`);
  this.initialize();
}

Client.prototype.initialize = function() {
  this.setupListeners();
  this.socket.emit('register_id', this.id);
  this.socket.emit('map_state', world.getMapData());
  this.socket.emit('current_players', world.getClients());
  this.socket.emit('current_bombs', world.getBombPositions());
  this.socket.emit('current_building_tiles', world.getBuilders());
  this.active = true;
};

Client.prototype.setupListeners = function() {
  this.socket.on('set_name', this.handleSetName.bind(this));
  this.socket.on('disconnect', this.handleDisconnection.bind(this));
  this.socket.on('update_input', this.handleUpdateInput.bind(this));
  this.socket.on('drop_bomb', this.handleDropBomb.bind(this));
  this.socket.on('respawn', this.handleRespawn.bind(this));
  this.socket.on('start_building', this.handleStartBuilding.bind(this));
  this.socket.on('stop_building', this.handleStopBuilding.bind(this));
};

Client.prototype.handleSetName = function(playerName) {
  this.setName(playerName);
  this.setInitialPos(world.getRandomPos(), this.getColor());
};

Client.prototype.handleRespawn = function() {
  const pos = world.getRandomPos();
  this.pos = pos;
  this.io.emit('player_respawn', this.id, this.pos);
};

Client.prototype.handleStartBuilding = function(pos, direction) {
  let gridPos = world.coordsToGridPos(pos);
  gridPos.x += direction.x;
  gridPos.y += direction.y;

  if (this.buildingTile) {
    gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
  }

  this.buildingTile = world.getTile(gridPos.x, gridPos.y);
  world.startBuilding(gridPos.x, gridPos.y);
};

Client.prototype.handleStopBuilding = function(pos, direction) {
  if (!this.buildingTile) {
    const gridPos = world.coordsToGridPos(pos);
    gridPos.x += direction.x;
    gridPos.y += direction.y;
    world.stopBuilding(gridPos.x, gridPos.y);
  } else {
    const gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
    this.buildingTile = null;
  }
};

Client.prototype.handleDisconnection = function() {
  console.log(`Client disconnected ${this.id}`);
  world.removeClient(this.id);
  this.socket.broadcast.emit('remove_player', this.id);

  if (this.buildingTile) {
    const gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
    this.buildingTile = null;
  }
};

Client.prototype.setInitialPos = function(pos) {
  this.pos = pos;
  this.socket.emit('set_initial_pos', this.pos, this.playerName, this.color);
  this.socket.broadcast.emit('add_player', this.id, this.playerName, this.pos, this.color);
};

Client.prototype.handleUpdateInput = function(input, pos) {
  this.pos = pos;
  this.socket.broadcast.emit('update_input', this.id, input, pos);
};

Client.prototype.handleDropBomb = function(pos) {
  if (this.bombs.length < MAX_BOMBS) {
    const bomb = world.addBomb(this, pos.x, pos.y);
    if (bomb) {
      console.log(`Bomb dropped at ${bomb.pos.x}, ${bomb.pos.y}`);
      this.io.emit('drop_bomb', bomb.id, bomb.pos, bomb.fuse);
      this.bombs.push(bomb);
    }
  }
};

Client.prototype.setName = function(playerName) {
  if (playerName.length > 2 && playerName.length < 15) {
    this.playerName = playerName;
  } else {
    this.playerName = Math.floor("Guest" + Math.random() * 999);
  }
};

Client.prototype.getColor = function() {
  return this.color || (this.color = Math.random() * 0xffffff);
};

Client.prototype.removeBomb = function(id) {
  this.bombs = this.bombs.filter(function(bomb) {
    return bomb.id !== id;
  });
};

Client.prototype.update = function() {
  if (this.active) {
    if (!!this.buildingTile) {
      this.buildingTile.update();
    }
  }
};

module.exports = Client;
