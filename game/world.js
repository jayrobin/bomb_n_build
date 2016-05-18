const world = {
  WIDTH: 500,
  HEIGHT: 340,
  clients: [],
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
      return client.getPos();
    });
  }
};

module.exports = world;
