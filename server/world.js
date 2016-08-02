'use strict';

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
  lastTick: new Date().getTime(),
  setServer: function(server) {
    this.server = server;
  },
  buildMap: function(mapData) {
    this.spawnTiles = [];
    this.map = [];

    const rows = mapData.split('\n');
    rows.forEach((row, y) => {
      let mapRow = [];
      row.split('').forEach((cell, x) => {
        cell = parseInt(cell, 10);
        let tile = new Tile({ x: x, y: y }, cell, world);
        if (cell === Tile.TYPE.SAFE) {
          this.spawnTiles.push(tile);
        }
        tile.addObserver(this, events.TILE.UPGRADE);
        mapRow.push(tile);
      });
      this.map.push(mapRow);
    });
  },
  getRandomPos: function() {
    const randomSafeTile = this.spawnTiles[Math.floor(Math.random() * this.spawnTiles.length)];

    return {
      x: randomSafeTile.pos.x * this.CELL_SIZE + this.CELL_SIZE / 2,
      y: randomSafeTile.pos.y * this.CELL_SIZE + this.CELL_SIZE / 2
    };
  },
  addClient: function(client) {
    this.clients.push(client);
  },
  removeClient: function(id) {
    for (let i = 0; i < this.clients.length; i++) {
      let client = this.clients[i];
      if (client.id === id) {
        this.clients.splice(i, 1);
        return true;
      }
    }

    return false;
  },
  getClients: function() {
    return this.clients.map((client) => {
      return { id: client.id, playerName: client.playerName, pos: client.pos, color: client.color };
    });
  },
  getBombPositions: function() {
    return this.bombs.map((bomb) => {
      return { id: bomb.id, pos: bomb.pos, fuse: bomb.fuse };
    });
  },
  addBomb: function(player, x, y) {
    const pos = this.clipPosToGrid({x, y});

    if (this.isValidBombPosition(pos)) {
      const bomb = new Bomb(player, rnd.generate(8), pos.x, pos.y, this);
      bomb.addObserver(this, events.BOMB.EXPLODE);
      this.bombs.push(bomb);
      return bomb;
    }
  },
  removeBomb: function(id) {
    for (let i = 0; i < this.bombs.length; i++) {
      let bomb = this.bombs[i];
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
    const tile = this.getTile(x, y);
    if (tile.isUpgradable()) {
      tile.startBuilding();
      this.server.emit('set_tile_build_speed', { x: x, y: y }, tile.getBuildInfo());
    }
  },
  stopBuilding: function(x, y) {
    const tile = this.getTile(x, y);
    tile.stopBuilding();
    this.server.emit('set_tile_build_speed', { x: x, y: y }, tile.getBuildInfo());
  },
  getBuilders: function() {
    return this.clients.filter((client) => {
      return !!client.buildingTile;
    }).map((builder) => {
      const tile = builder.buildingTile;
      return { pos: tile.pos, buildInfo: tile.getBuildInfo() };
    });
  },
  damageTile: function(x, y, amount) {
    amount = amount || 1;

    const tile = this.getTile(x, y);
    if (tile.damage(amount)) {
      this.server.emit('set_tile', { x: x, y: y }, tile.type);
    }
  },
  detonateBomb: function(bomb) {
    const gridPos = this.coordsToGridPos(bomb.pos);
    this.createExplosion(gridPos.x, gridPos.y);
    this.removeBomb(bomb.id);
    bomb.removeObserver(this, events.BOMB.EXPLODE);
  },
  createExplosion: function(x, y) {
    const explosions = [];
    let overlappingBombs = [];
    for (let gy = y - 1; gy <= y + 1; gy++) {
      for (let gx = x - 1; gx <= x + 1; gx++) {
        explosions.push({ x: gx * this.CELL_SIZE, y: gy * this.CELL_SIZE });
        if (gx === x && gy === y) {
          this.damageTile(gx, gy, 2);
        } else {
          this.damageTile(gx, gy, 1);
        }

        overlappingBombs = overlappingBombs.concat(this.bombs.filter((bomb) => {
          if (bomb.active) {
            let bombGridPos = this.coordsToGridPos(bomb.pos);
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
    this.bombs.forEach((bomb) => {
      bomb.update();
    });
    this.clients.forEach((client) => {
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
    const clippedPos = {
      x: Math.floor(pos.x / this.CELL_SIZE) * this.CELL_SIZE,
      y: Math.floor(pos.y / this.CELL_SIZE) * this.CELL_SIZE
    };

    return clippedPos;
  },
  coordsToGridPos: function(coords) {
    const gridPos = {
      x: Math.floor(coords.x / this.CELL_SIZE),
      y: Math.floor(coords.y / this.CELL_SIZE),
    };

    return gridPos;
  },
  isValidBombPosition: function(pos) {
    for (let i = 0; i < this.bombs.length; i++) {
      let bomb = this.bombs[i];
      if (bomb.pos.x === pos.x && bomb.pos.y === pos.y) {
        return false;
      }
    }

    const gridPos = this.coordsToGridPos(pos);
    const tile = this.getTile(gridPos.x, gridPos.y);
    if (!tile.isPassable()) {
      return false;
    }

    return true;
  },
  getMapData: function() {
    return this.map.map((row) => {
      return row.map((tile) => {
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
