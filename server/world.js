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
    this.mapWidth = this.map.length;
    this.mapHeight = this.map[0].length;
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
      return {
        id: client.id,
        playerName: client.playerName,
        pos: client.pos,
        score: client.score,
        color: client.color
      };
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

      const gridPos = this.coordsToGridPos(pos);
      const tile = this.getTile(gridPos.x, gridPos.y);
      tile.bomb = bomb;

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
    if (x >= 0 && y >= 0 && x < this.mapWidth && y < this.mapHeight) {
      return this.map[y][x];
    } else {
      return null;
    }
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
    const tile = this.getTile(gridPos.x, gridPos.y);
    tile.bomb = null;
    this.createExplosion(gridPos.x, gridPos.y, bomb.player);
    this.removeBomb(bomb.id);
    bomb.removeObserver(this, events.BOMB.EXPLODE);
  },
  createExplosion: function(x, y, owner) {
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

    const bombRect = {
      x: (x - 1) * this.CELL_SIZE,
      y: (y - 1) * this.CELL_SIZE,
      width: 3 * this.CELL_SIZE,
      height: 3 * this.CELL_SIZE
    };

    let anyPlayersKilled = false;
    this.clients.forEach((player) => {
      if (player.active) {
        let playerRect = { x: player.pos.x - player.width / 2, y: player.pos.y - player.height / 2, width: player.width, height: player.height };
        if (this.checkOverlapping(playerRect, bombRect)) {
          player.kill();
          this.server.emit('kill_player', player.id);
          if (player !== owner) {
            anyPlayersKilled = true;
            owner.score++;
          }
        }
      }
    });

    this.server.emit('create_explosions', explosions);

    if (anyPlayersKilled) {
      this.server.emit('set_player_score', owner.id, owner.score);
    }

    overlappingBombs.forEach(function(bomb) {
      bomb.explode();
    });
  },
  checkOverlapping(rect1, rect2) {
      // top left
    return ((rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.width) && (rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.height) ||
      // top right
      (rect1.x + rect1.width >= rect2.x && rect1.x + rect1.width <= rect2.x + rect2.width) && (rect1.y >= rect2.y && rect1.y <= rect2.y + rect2.height) ||
      // bottom left
      (rect1.x >= rect2.x && rect1.x <= rect2.x + rect2.width) && (rect1.y + rect1.height >= rect2.y && rect1.y + rect1.height <= rect2.y + rect2.height) ||
      // bottom right
      (rect1.x + rect1.width >= rect2.x && rect1.x + rect1.width <= rect2.x + rect2.width) && (rect1.y + rect1.height >= rect2.y && rect1.y + rect1.height <= rect2.y + rect2.height));
  },
  tick: function() {
    let updates = [];
    this.bombs.forEach((bomb) => {
      bomb.update();
    });
    this.clients.forEach((client) => {
      client.update();

      if (client.dirty) {
        updates.push({ id: client.id, pos: client.pos });
        client.dirty = false;
      }
    });

    if (updates.length > 0) {
      this.server.emit('update_players', updates);
    }

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
  resolveTileCollisions(body, targetPos) {
    if (body.velocity.y > 0) {
      const leftX = body.pos.x - body.width / 2 + 1;
      const rightX = body.pos.x + body.width / 2 - 1;
      const leftGridPos = this.coordsToGridPos({ x: leftX, y: targetPos.y + body.height / 2 + 4 });
      const rightGridPos = this.coordsToGridPos({ x: rightX, y: targetPos.y + body.height / 2 + 4 });

      const leftTile = this.getTile(leftGridPos.x, leftGridPos.y);
      const rightTile = this.getTile(rightGridPos.x, rightGridPos.y);
      if ((leftTile && !leftTile.isPassable()) || (rightTile && !rightTile.isPassable())) {
        targetPos.y = leftGridPos.y * this.CELL_SIZE - body.height / 2 - 4;
      }
    } else if (body.velocity.y < 0) {
      const leftX = body.pos.x - body.width / 2 + 1;
      const rightX = body.pos.x + body.width / 2 - 1;
      const leftGridPos = this.coordsToGridPos({ x: leftX, y: targetPos.y - body.height / 2 });
      const rightGridPos = this.coordsToGridPos({ x: rightX, y: targetPos.y - body.height / 2 });

      const leftTile = this.getTile(leftGridPos.x, leftGridPos.y);
      const rightTile = this.getTile(rightGridPos.x, rightGridPos.y);
      if ((leftTile && !leftTile.isPassable()) || (rightTile && !rightTile.isPassable())) {
        targetPos.y = (leftGridPos.y + 1) * this.CELL_SIZE + body.height / 2;
      }
    }

    if (body.velocity.x > 0) {
      const topY = body.pos.y - body.height / 2 + 1;
      const bottomY = body.pos.y + body.height / 2 - 1;
      const topGridPos = this.coordsToGridPos({ x: targetPos.x + body.width / 2, y: topY });
      const bottomGridPos = this.coordsToGridPos({ x: targetPos.x + body.width / 2, y: bottomY });

      const topTile = this.getTile(topGridPos.x, topGridPos.y);
      const bottomTile = this.getTile(bottomGridPos.x, bottomGridPos.y);
      if ((topTile && !topTile.isPassable()) || (bottomTile && !bottomTile.isPassable())) {
        targetPos.x = topGridPos.x * this.CELL_SIZE - body.width / 2;
      }
    } else if (body.velocity.x < 0) {
      const topY = body.pos.y - body.height / 2 + 1;
      const bottomY = body.pos.y + body.height / 2 - 1;
      const topGridPos = this.coordsToGridPos({ x: targetPos.x - body.width / 2, y: topY });
      const bottomGridPos = this.coordsToGridPos({ x: targetPos.x - body.width / 2, y: bottomY });

      const topTile = this.getTile(topGridPos.x, topGridPos.y);
      const bottomTile = this.getTile(bottomGridPos.x, bottomGridPos.y);
      if ((topTile && !topTile.isPassable()) || (bottomTile && !bottomTile.isPassable())) {
        targetPos.x = (topGridPos.x + 1) * this.CELL_SIZE + body.width / 2;
      }
    }
    return targetPos;
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
