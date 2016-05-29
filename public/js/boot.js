var bootState = {
  preload: function() {
    game.load.image('player', 'assets/img/player.png');
  },
  create: function() {
    game.stage.backgroundColor = '#3498db';
    game.stage.disableVisibilityChange = true;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    if (!game.device.desktop) {
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
      document.body.style.backgroundColor = '#3498db';
      game.scale.minWidth = 250;
      game.scale.minHeight = 170;
      game.scale.maxWidth = 500;
      game.scale.maxHeight = 340;
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
    }
    game.state.start('menu');
  }
};
