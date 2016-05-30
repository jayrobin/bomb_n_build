function LocalPlayer(x, y) {
  this.initialize();
  this.sprite = game.add.sprite(x, y, 'player');
  game.physics.arcade.enable(this.sprite);
  this.cursor = game.input.keyboard.createCursorKeys();
  this.sprite.anchor.setTo(0.5, 0.5)
}

LocalPlayer.prototype = new Player();
LocalPlayer.constructor = LocalPlayer;

LocalPlayer.prototype.update = function() {
  this.updateInput();
  this.updatePos();
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
    Client.updateInput(this.input);
  }
};
