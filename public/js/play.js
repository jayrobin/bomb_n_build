var playState = {
  create: function() {
    this.running = false;
    this.players = [];
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
    this.player = new LocalPlayer(x, y);
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
  start: function() {
    this.running = true;
  }
};
