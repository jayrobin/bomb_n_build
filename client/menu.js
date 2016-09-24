var playerName = "Guest" + Math.floor(Math.random() * 999);
var version = '0.1';
var menuState = {
  create: function() {
    this.game.world.setBounds(0, 0, 480, 340);

    var nameLabel = game.add.text(game.world.centerX, 50, 'Bomb n Build', { font: '50px Arial', fill: '#ffffff' });
    nameLabel.anchor.setTo(0.5, 0.5);

    var infoLabel = game.add.text(game.world.centerX, game.world.height / 2 + 30, "WASD/cursors to move\nSPACE to drop bombs\nSHIFT to build", { font: '16px Arial', fill: '#ffffff', align: 'center' });
    infoLabel.anchor.setTo(0.5, 0.5);

    var startLabel = game.add.text(game.world.centerX, game.world.height - 30, 'Press ENTER to start', { font: '25px Arial', fill: '#ffffff' });
    startLabel.anchor.setTo(0.5, 0.5);

    var versionLabel = game.add.text(5, game.world.height - 15, version, { font: '10px Arial', fill: '#ffffff', align: 'left' });

    var upKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    upKey.onDown.addOnce(this.start, this);

    this.addNameInput();
  },
  addNameInput: function() {
    var inputWidth = 100;
    this.nameInput = game.add.inputField(game.world.width / 2 - inputWidth / 2,
                                        game.world.height / 2 - 70,
                                        {
                                          font: '12px Arial',
                                          fill: '#212121',
                                          fontWeight: 'bold',
                                          width: inputWidth,
                                          padding: 8,
                                          borderWidth: 1,
                                          borderColor: '#000',
                                          borderRadius: 3,
                                          placeHolder: 'Enter name',
                                        });
  },
  start: function() {
    playerName = this.nameInput.value || playerName;
    game.state.start('play');
  }
};
