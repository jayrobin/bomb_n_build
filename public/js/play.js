var playState = {
  create: function() {
    this.player = new Player(game.world.centerX, game.world.centerY);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Client.connect();
  },
  update: function() {
    this.player.update();
  }
};
