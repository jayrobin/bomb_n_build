var bootState = {
  preload: function() {
    game.load.spritesheet('player', 'assets/img/tintPlayer.png', 32, 32, 12);
    game.load.spritesheet('enemy', 'assets/img/tintPlayer.png', 32, 32, 12);
    game.load.spritesheet('explosion', 'assets/img/explosion.png', 32, 32, 8);
    game.load.spritesheet('buildIndicator', 'assets/img/buildIndicator.png', 32, 32, 8);
    game.load.spritesheet('bomb', 'assets/img/bomb.png', 32, 32, 14);
    game.load.image('tiles', 'assets/img/tiles.png');

    game.add.plugin(Fabrique.Plugins.InputField);
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
