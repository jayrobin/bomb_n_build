var menuState = {
  create: function() {
    var nameLabel = game.add.text(game.world.centerX, 50, 'Bomb n Build', { font: '50px Arial', fill: '#ffffff' });
    nameLabel.anchor.setTo(0.5, 0.5);

    var infoLabel = game.add.text(game.world.centerX, game.world.height / 2, "SPACE to drop bombs\nSHIFT to build", { font: '20px Arial', fill: '#ffffff', align: 'center' });
    infoLabel.anchor.setTo(0.5, 0.5);

    var startLabel = game.add.text(game.world.centerX, game.world.height - 80, 'Press ENTER to start', { font: '25px Arial', fill: '#ffffff' });
    startLabel.anchor.setTo(0.5, 0.5);

    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    upKey.onDown.addOnce(this.start, this);
  },
  start: function() {
    game.state.start('play');
  }
};
