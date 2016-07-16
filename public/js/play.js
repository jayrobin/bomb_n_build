var playState = {
  mapData: [
    [1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1]
  ],
  create: function() {
    this.running = false;
    this.players = [];
    this.bombs = [];
    this.world = new World();
    this.world.setTiles(this.mapData);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Client.connect(this);
  },
  update: function() {
    if (this.running) {
      this.player.update();

      this.players.forEach(function(player) {
        player.update();
      });
    }
  },
  createPlayer: function(x, y) {
    this.player = new LocalPlayer(x, y, this);
  },
  createNetPlayer: function(id, x, y) {
    var player = new NetPlayer(id, x, y);
    this.players.push(player);
  },
  findPlayerById(id) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      if (player.id === id) {
        return player;
      }
    }
  },
  removeNetPlayer: function(id) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      if (player.id === id) {
        this.players.splice(i, 1);
        player.remove();
        return;
      }
    }
  },
  addBomb: function(id, x, y) {
    var bomb = new Bomb(id, x, y);
    this.bombs.push(bomb);
  },
  removeBomb: function(id) {
    for (var i = 0; i < this.bombs.length; i++) {
      var bomb = this.bombs[i];

      if (bomb.id === id) {
        this.bombs.splice(i, 1);
        bomb.remove();
        return;
      }
    }
  },
  start: function() {
    this.running = true;
  }
};
