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
  }
};

module.exports = world;
