var playState = {
  create: function() {
    this.running = false;
    this.players = [];
    this.bombs = [];
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
  start: function() {
    this.running = true;
  }
};
