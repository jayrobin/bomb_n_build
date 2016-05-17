var menuState = {
  create: function() {
    var nameLabel = game.add.text(game.world.centerX, -50, 'Multi Game', { font: '50px Geo', fill: '#ffffff' });
    nameLabel.anchor.setTo(0.5, 0.5);

    var startLabel = game.add.text(game.world.centerX, game.world.height - 80, 'Press the up arrow key to start', { font: '25px Arial', fill: '#ffffff' });
    startLabel.anchor.setTo(0.5, 0.5);

    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    upKey.onDown.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};
