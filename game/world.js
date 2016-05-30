const Bomb = require('./bomb');

const world = {
  WIDTH: 500,
  HEIGHT: 340,
  clients: [],
  bombs: [],
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
  addBomb: function(x, y) {
    var bomb = new Bomb(x, y, this.bombs.length);
    this.bombs.push(bomb);

    return bomb.id;
  }
};

module.exports = world;
