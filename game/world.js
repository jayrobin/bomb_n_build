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
    var mapHeight = this.map.length;
    var mapWidth = this.map[0].length;
    const MAX_ATTEMPTS = 20;
    var attempts = 0;
    var x, y, pos;
    while (attempts < MAX_ATTEMPTS) {
      x = 1 + Math.floor(Math.random() * (mapWidth - 1));
      y = 1 + Math.floor(Math.random() * (mapHeight - 1));

      var tileType = this.getTile(x, y).type;
      if (tileType === 2 || tileType === 3 || tileType === 4) {
        return {
          x: x * this.CELL_SIZE + this.CELL_SIZE / 2,
          y: y * this.CELL_SIZE + this.CELL_SIZE / 2
        };
      }
      attempts++;
    }

    var pos = {
      x: x,
      y: y
    }
    this.setTileType(x, y, 4);

    return {
      x: x * this.CELL_SIZE + this.CELL_SIZE / 2,
      y: y * this.CELL_SIZE + this.CELL_SIZE / 2
    };
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
  getClients: function() {
    return this.clients.map(function(client) {
      return { id: client.id, pos: client.pos, color: client.color };
    });
  },
  getBombPositions: function() {
    return this.bombs.map(function(bomb) {
      return { id: bomb.id, pos: bomb.pos, fuse: bomb.fuse };
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
  setTileType: function(x, y, type) {
    this.map[y][x].type = type;
    this.server.emit('set_tile', { x: x, y: y }, type);
  },
  upgradeTile: function(x, y) {
    return this.getTile(x, y).upgrade();
  },
  startBuilding: function(x, y) {
    var tile = this.getTile(x, y);
    tile.startBuilding();
    this.server.emit('set_tile_build_speed', { x: x, y: y }, tile.getBuildInfo());
  },
  stopBuilding: function(x, y) {
    var tile = this.getTile(x, y);
    tile.stopBuilding();
    this.server.emit('set_tile_build_speed', { x: x, y: y }, tile.getBuildInfo());
  },
  getBuilders: function() {
    return this.clients.filter(function(client) {
      return !!client.buildingTile;
    }).map(function(builder) {
      var tile = builder.buildingTile;
      return { pos: tile.pos, buildInfo: tile.getBuildInfo() };
    });
  },
  damageTile: function(x, y, amount) {
    amount = amount || 1;

    var tileType = this.getTile(x, y).damage(amount);
    if (tileType >= 0) {
      this.server.emit('set_tile', { x: x, y: y }, tileType);
    }
  },
  detonateBomb: function(bomb) {
    var gridPos = this.coordsToGridPos(bomb.pos);
    this.createExplosion(gridPos.x, gridPos.y);
    this.removeBomb(bomb.id);
    bomb.removeObserver(this, events.BOMB.EXPLODE);
  },
  createExplosion: function(x, y) {
    var explosions = [];
    var overlappingBombs = [];
    for (var gy = y - 1; gy <= y + 1; gy++) {
      for (var gx = x - 1; gx <= x + 1; gx++) {
        explosions.push({ x: gx * this.CELL_SIZE, y: gy * this.CELL_SIZE });
        if (gx === x && gy === y) {
          this.damageTile(gx, gy, 2);
        } else {
          this.damageTile(gx, gy, 1);
        }

        overlappingBombs = overlappingBombs.concat(this.bombs.filter(function(bomb) {
          if (bomb.active) {
            var bombGridPos = this.coordsToGridPos(bomb.pos);
            if (bombGridPos.x === gx && bombGridPos.y === gy) {
              bomb.active = false;
              return true;
            }
          }
          return false;
        }, this));
      }
    }

    this.server.emit('create_explosions', explosions);

    overlappingBombs.forEach(function(bomb) {
      bomb.explode();
    });
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
        this.detonateBomb(entity);
      break;
      case events.TILE.UPGRADE:
        this.server.emit('set_tile', entity.pos, entity.type);
        this.server.emit('set_tile_build_speed', entity.pos, entity.getBuildInfo());
      break;
    }
  }
};

module.exports = world;
