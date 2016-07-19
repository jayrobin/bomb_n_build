function LocalPlayer(x, y) {
  Phaser.Sprite.call(this, game, x, y, 'player');
  this.initialize();
  this.cursor = game.input.keyboard.createCursorKeys();
  this.setupControls();
}

LocalPlayer.prototype = Object.create(Player.prototype);
LocalPlayer.constructor = LocalPlayer;

LocalPlayer.prototype.setupControls = function() {
  var dropBomb = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  dropBomb.onDown.add(this.dropBomb, this);

  var upgradeTile = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  upgradeTile.onDown.add(this.upgradeTile, this);
};

LocalPlayer.prototype.update = function() {
  this.updateInput();
  this.updatePos();
  this.updateAnim(this.input.keys.up ||
                  this.input.keys.down ||
                  this.input.keys.left ||
                  this.input.keys.right);
};

LocalPlayer.prototype.updateInput = function() {
  var inputDelta = {
    keys: {}
  };

  var update = false;

  if (this.input.keys.up !== this.cursor.up.isDown) {
    this.input.keys.up = inputDelta.keys.up = this.cursor.up.isDown;
    update = true;
  }
  if (this.input.keys.down !== this.cursor.down.isDown) {
    this.input.keys.down = inputDelta.keys.down = this.cursor.down.isDown;
    update = true;
  }
  if (this.input.keys.left !== this.cursor.left.isDown) {
    this.input.keys.left = inputDelta.keys.left = this.cursor.left.isDown;
    update = true;
  }
  if (this.input.keys.right !== this.cursor.right.isDown) {
    this.input.keys.right = inputDelta.keys.right = this.cursor.right.isDown;
    update = true;
  }

  if (update) {
    Client.updateInput(this.input, { x: this.x, y: this.y });
  }
};

LocalPlayer.prototype.dropBomb = function() {
  Client.dropBomb(this.x, this.y);
};

LocalPlayer.prototype.upgradeTile = function() {
  Client.upgradeTile(this.x, this.y, this.getDirection());
};
