window.game = new Phaser.Game(480, 340, Phaser.AUTO, 'game');

game.state.add('boot', require('./boot'));
game.state.add('menu', require('./menu'));
game.state.add('play', require('./play'));

game.state.start('boot');
