const events = require('./events');
const Bomb = require('./bomb');

const world = {
  WIDTH: 500,
  HEIGHT: 340,
  CELL_SIZE: 32,
  clients: [],
  bombs: [],
  map: [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  lastTick: new Date().getTime(),
  setServer: function(server) {
    this.server = server;
  },
  getRandomPos: function() {
    var pos = {};
    pos.x = Math.floor(Math.random() * this.WIDTH) + 1;
    pos.y = Math.floor(Math.random() * this.HEIGHT) + 1;

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

    var bomb = new Bomb(pos.x, pos.y, this.bombs.length, this);
    bomb.addObserver(this, events.BOMB.EXPLODE);
    this.bombs.push(bomb);

    return bomb;
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
    }

    return clippedPos;
  },
  notify: function(entity, event) {
    switch(event) {
      case 'bomb.explode':
        this.removeBomb(entity.id);
        entity.removeObserver(this, events.BOMB.EXPLODE);
      break;
    }
  }
};

module.exports = world;
