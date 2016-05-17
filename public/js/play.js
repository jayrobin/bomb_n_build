var playState = {
  create: function() {
    this.player = new Player(game.world.centerX, game.world.centerY);
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.socket = io();
  },
  update: function() {
    this.player.update();
  }
};
