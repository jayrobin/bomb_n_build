var game = new Phaser.Game(480, 340, Phaser.AUTO, 'game');

game.state.add('boot', bootState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');