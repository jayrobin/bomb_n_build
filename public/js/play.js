var playState = {
  create: function() {
    this.running = false;
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
  start: function() {
    this.running = true;
  }
};
