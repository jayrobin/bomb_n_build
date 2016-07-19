const rnd = require ('randomstring');
const events = require('./events');
const Bomb = require('./bomb');

const world = {
  WIDTH: 500,
  HEIGHT: 340,
  CELL_SIZE: 32,
  clients: [],
  bombs: [],
  map: [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,4,4,4,4,4,4,4,4,4,4,4,4,4,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  lastTick: new Date().getTime(),
  setServer: function(server) {
    this.server = server;
  },
  getRandomPos: function() {
    var pos = {};
    pos.x = this.CELL_SIZE + Math.floor(Math.random() * (this.WIDTH - this.CELL_SIZE * 2));
    pos.y = this.CELL_SIZE + Math.floor(Math.random() * (this.HEIGHT - this.CELL_SIZE * 2));

    return pos;
  },
  addClient: function(client) {
    this.clients.push(client);
  },
  removeClient: function(id) {
    for (var i = 0; i < this.clients.length; i++) {
      var client = this.clients[i];
      if (client.id === id) {
        this.clients.splice(i, 1);
        return true;
      }
    }

    return false;
  },
  getClientPositions: function() {
    return this.clients.map(function(client) {
      return { id: client.id, pos: client.pos };
    });
  },
  getBombPositions: function() {
    return this.bombs.map(function(bomb) {
      return { id: bomb.id, pos: bomb.pos };
    });
  },
  addBomb: function(x, y) {
    var pos = this.clipPosToGrid({x, y});

    if (this.isValidBombPosition(pos)) {
      var bomb = new Bomb(rnd.generate(8), pos.x, pos.y, this);
      bomb.addObserver(this, events.BOMB.EXPLODE);
      this.bombs.push(bomb);
      return bomb;
    }
  },
  removeBomb: function(id) {
    for (var i = 0; i < this.bombs.length; i++) {
      var bomb = this.bombs[i];
      if (bomb.id === id) {
        this.server.emit('remove_bomb', id);
        this.bombs.splice(i, 1);
        return true;
      }
    }

    return false;
  },
  upgradeTile: function(x, y) {
    var oldTileState = this.map[y][x];
    if (oldTileState > 0) {
      if (oldTileState < 4) {
        this.map[y][x] = 4;
      } else if (oldTileState < 8) {
        this.map[y][x] += 1;
      }
    }
    return this.map[y][x];
  },
  damageTile: function(x, y, amount) {
    amount = amount || 1;

    if (this.map[y][x] > 0) {
      this.map[y][x] = Math.max(1, this.map[y][x] - amount);
      this.server.emit('set_tile', { x: x, y: y }, this.map[y][x]);
    }
  },
  createExplosion: function(x, y) {
    for (var gy = y - 1; gy <= y + 1; gy++) {
      for (var gx = x - 1; gx <= x + 1; gx++) {
        if (gx === x && gy === y) {
          this.damageTile(gx, gy, 2);
        } else {
          this.damageTile(gx, gy, 1);
        }
      }
    }
  },
  tick: function() {
    this.bombs.forEach(function(bomb) {
      bomb.update();
    });
    this.clients.forEach(function(client) {
      client.update();
    });
    this.lastTick = this.getTime();
  },
  getTime: function() {
    return new Date().getTime();
  },
  getElapsed: function() {
    return this.getTime() - this.lastTick;
  },
  clipPosToGrid: function(pos) {
    var clippedPos = {
      x: Math.floor(pos.x / this.CELL_SIZE) * this.CELL_SIZE,
      y: Math.floor(pos.y / this.CELL_SIZE) * this.CELL_SIZE
    };

    return clippedPos;
  },
  coordsToGridPos: function(coords) {
    var gridPos = {
      x: Math.floor(coords.x / this.CELL_SIZE),
      y: Math.floor(coords.y / this.CELL_SIZE),
    };

    return gridPos;
  },
  isValidBombPosition: function(pos) {
    for (var i = 0; i < this.bombs.length; i++) {
      var bomb = this.bombs[i];
      if (bomb.pos.x === pos.x && bomb.pos.y === pos.y) {
        return false;
      }
    }

    return true;
  },
  notify: function(entity, event) {
    switch(event) {
      case 'bomb.explode':
        var gridPos = this.coordsToGridPos(entity.pos);
        this.createExplosion(gridPos.x, gridPos.y);
        this.removeBomb(entity.id);
        entity.removeObserver(this, events.BOMB.EXPLODE);
      break;
    }
  }
};

module.exports = world;
