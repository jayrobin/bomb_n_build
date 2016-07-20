const rnd = require ('randomstring');
const events = require('./events');
const Bomb = require('./bomb');
const Tile = require('./tile');

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
  buildMap: function() {
    this.map = this.map.map(function(row, y) {
      return row.map(function(cell, x) {
        var tile = new Tile({ x: x, y: y }, cell, world);
        tile.addObserver(this, events.TILE.UPGRADE);
        return tile;
      }, this);
    }, this);
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
  addBomb: function(player, x, y) {
    var pos = this.clipPosToGrid({x, y});

    if (this.isValidBombPosition(pos)) {
      var bomb = new Bomb(player, rnd.generate(8), pos.x, pos.y, this);
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
  getTile: function(x, y) {
    return this.map[y][x];
  },
  upgradeTile: function(x, y) {
    return this.map[y][x].upgrade();
  },
  startBuilding: function(x, y) {
    this.map[y][x].startBuilding();
  },
  stopBuilding: function(x, y) {
    this.map[y][x].stopBuilding();
  },
  damageTile: function(x, y, amount) {
    amount = amount || 1;

    var tileType = this.map[y][x].damage(amount);
    if (tileType >= 0) {
      this.server.emit('set_tile', { x: x, y: y }, tileType);
    }
  },
  createExplosion: function(x, y) {
    var explosions = []
    for (var gy = y - 1; gy <= y + 1; gy++) {
      for (var gx = x - 1; gx <= x + 1; gx++) {
        explosions.push({ x: gx * this.CELL_SIZE, y: gy * this.CELL_SIZE });
        if (gx === x && gy === y) {
          this.damageTile(gx, gy, 2);
        } else {
          this.damageTile(gx, gy, 1);
        }
      }
    }
    this.server.emit('create_explosions', explosions);
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
  getMapData: function() {
    return this.map.map(function(row) {
      return row.map(function(tile) {
        return tile.type;
      });
    });
  },
  notify: function(entity, event) {
    switch(event) {
      case events.BOMB.EXPLODE:
        var gridPos = this.coordsToGridPos(entity.pos);
        this.createExplosion(gridPos.x, gridPos.y);
        this.removeBomb(entity.id);
        entity.removeObserver(this, events.BOMB.EXPLODE);
      break;
      case events.TILE.UPGRADE:
        this.server.emit('set_tile', entity.pos, entity.type);
      break;
    }
  }
};

module.exports = world;
