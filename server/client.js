'use strict';

const world = require('./world');

const WIDTH = 24;
const HEIGHT = 28;
const MAX_BOMBS = 2;
const SPEED = 100;
const RATE_LIMIT_PER_TICK = 10;
const KEYS = ['up', 'down', 'left', 'right'];
const KEY_AXIS = {
  up: { descriptor: 'y', multiplier: -1 },
  down: { descriptor: 'y', multiplier: 1 },
  left: { descriptor: 'x', multiplier: -1 },
  right: { descriptor: 'x', multiplier: 1 }
};

function Client(id, socket, io) {
  this.id = id;
  this.socket = socket;
  this.io = io;
  this.active = false;
  this.dirty = false;
  this.bombs = [];
  this.pos = { x: 0, y: 0 };
  this.score = 0;
  this.messagesReceivedThisTick = 0;
  this.width = WIDTH;
  this.height = HEIGHT;
  this.resetInput();
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

Client.prototype.resetInput = function() {
  this.input = { keys: { up: {}, down: {}, left: {}, right: {} } };
  this.velocity = { x: 0, y: 0 };
};

Client.prototype.handleSetName = function(playerName) {
  this.messagesReceivedThisTick++;
  this.setName(playerName);
  this.setInitialPos(world.getRandomPos(), this.getColor());
};

Client.prototype.handleRespawn = function() {
  this.messagesReceivedThisTick++;
  const pos = world.getRandomPos();
  this.pos = pos;
  this.active = true;
  this.score = 0;
  this.io.emit('player_respawn', this.id, this.pos);
};

Client.prototype.handleStartBuilding = function(direction) {
  this.messagesReceivedThisTick++;
  if (this.active) {
    let gridPos = world.coordsToGridPos(this.pos);
    gridPos.x += direction.x;
    gridPos.y += direction.y;

    if (this.buildingTile) {
      gridPos = this.buildingTile.pos;
      world.stopBuilding(gridPos.x, gridPos.y);
    }

    this.buildingTile = world.getTile(gridPos.x, gridPos.y);
    world.startBuilding(gridPos.x, gridPos.y);
    this.resetInput();
  }
};

Client.prototype.handleStopBuilding = function(direction) {
  this.messagesReceivedThisTick++;
  if (this.active) {
    if (!this.buildingTile) {
      const gridPos = world.coordsToGridPos(this.pos);
      gridPos.x += direction.x;
      gridPos.y += direction.y;
      world.stopBuilding(gridPos.x, gridPos.y);
    } else {
      const gridPos = this.buildingTile.pos;
      world.stopBuilding(gridPos.x, gridPos.y);
      this.buildingTile = null;
    }
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
  this.socket.broadcast.emit('add_player', this.id, this.playerName, this.pos, this.score, this.color);
};

Client.prototype.handleUpdateInput = function(input) {
  this.messagesReceivedThisTick++;
  Object.keys(input.keys).forEach((k) => {
    const axis = KEY_AXIS[k];
    const velocity = SPEED * axis.multiplier;
    if (!input.keys[k] && this.input.keys[k].pressed) {
      this.input.keys[k].pressed = false;
      if (this.input.keys[k].timePressed > 0) {
        this.input.keys[k].time = (this.input.keys[k].time || 0) + (world.getTime() - this.input.keys[k].timePressed);
        this.velocity[axis.descriptor] -= velocity;
      }
    } else {
      this.input.keys[k].pressed = true;
      this.input.keys[k].timePressed = world.getTime();
      this.velocity[axis.descriptor] += velocity;
    }
  });

  this.velocity.x = Math.min(Math.max(this.velocity.x, -SPEED), SPEED);
  this.velocity.y = Math.min(Math.max(this.velocity.y, -SPEED), SPEED);
};

Client.prototype.handleDropBomb = function() {
  this.messagesReceivedThisTick++;
  if (this.active && this.bombs.length < MAX_BOMBS) {
    const bombPos = world.clipPosToGrid(this.pos);
    const bomb = world.addBomb(this, bombPos.x, bombPos.y);
    if (bomb) {
      console.log(`Bomb dropped at ${bomb.pos.x}, ${bomb.pos.y}`);
      this.io.emit('drop_bomb', bomb.id, bomb.pos, bomb.fuse);
      this.bombs.push(bomb);
    }
  }
};

Client.prototype.isBuilding = function() {
  return !!this.buildingTile;
};

Client.prototype.setName = function(playerName) {
  playerName = playerName.replace(/[^ A-Za-z0-9]+/gi, '').trim();
  if (playerName.length > 2 && playerName.length < 15 && !world.getClientByName(playerName)) {
    this.playerName = playerName;
  } else {
    this.playerName = 'Guest' + Math.floor(Math.random() * 999);
  }
};

Client.prototype.getColor = function() {
  const color = this.color || (this.color = Math.random() * 0xffffff);
  return color;
};

Client.prototype.removeBomb = function(id) {
  this.bombs = this.bombs.filter((bomb) => {
    return bomb.id !== id;
  });
};

Client.prototype.kill = function() {
  this.active = false;
  if (this.buildingTile) {
    const gridPos = this.buildingTile.pos;
    world.stopBuilding(gridPos.x, gridPos.y);
    this.buildingTile = null;
  }
  this.resetInput();
};

Client.prototype.update = function() {
  if (this.active) {
    if (!this.pos) {
      this.socket.disconnect();
    }
    if (this.isBuilding()) {
      this.buildingTile.update();
    } else {
      this.updatePos();
    }
  }

  if (this.messagesReceivedThisTick > RATE_LIMIT_PER_TICK) {
    console.log(`Client kicked ${this.id} (${this.messagesReceivedThisTick} messages this tick)`);
    if (this.buildingTile) {
      this.buildingTile = null;
      const gridPos = this.buildingTile.pos;
      world.stopBuilding(gridPos.x, gridPos.y);
    }
    this.socket.disconnect();
  }
  this.messagesReceivedThisTick = 0;
};

Client.prototype.updatePos = function() {
  const worldTime = world.getTime();
  let targetPos;
  KEYS.forEach((k) => {
    if (this.input.keys[k]) {
      let elapsedInMs;
      if (this.input.keys[k].pressed) {
        elapsedInMs = worldTime - this.input.keys[k].timePressed;
        this.input.keys[k].timePressed = worldTime;
      } else {
        elapsedInMs = this.input.keys[k].time;
      }
      this.input.keys[k].time = 0;

      if (elapsedInMs) {
        const axis = KEY_AXIS[k];

        targetPos = targetPos || { x: this.pos.x, y: this.pos.y };
        targetPos[axis.descriptor] += this.velocity[axis.descriptor] * (elapsedInMs / 1000);
        this.dirty = true;
      }
    }
  });
  if (this.dirty) {
    this.pos = world.resolveTileCollisions(this, targetPos);
  }
};

module.exports = Client;
