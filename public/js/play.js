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
    }
  },
  createPlayer: function(x, y) {
    this.player = new Player(x, y);
  },
  createNetPlayer: function(id, x, y) {
    var player = new NetPlayer(id, x, y);
    this.players.push(player);
  },
  start: function() {
    this.running = true;
  }
};
