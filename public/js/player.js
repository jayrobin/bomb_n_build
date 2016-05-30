function Player(x, y) {
  this.sprite = game.add.sprite(x, y, 'player');
  game.physics.arcade.enable(this.sprite);
  this.cursor = game.input.keyboard.createCursorKeys();
  this.SPEED = 100;
  this.sprite.anchor.setTo(0.5, 0.5)
  this.setupInput();
}

Player.prototype.update = function() {
  this.updateInput();
  this.updatePos();
};

Player.prototype.setupInput = function() {
  this.input = {
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  };
};

Player.prototype.updateInput = function() {
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
    Client.updateInput(this.input.keys);
  }
};

Player.prototype.updatePos = function() {
  if (this.input.keys.up) {
    this.sprite.body.velocity.y = -this.SPEED;
  } else if (this.input.keys.down) {
    this.sprite.body.velocity.y = this.SPEED;
  } else {
    this.sprite.body.velocity.y = 0;
  }

  if (this.input.keys.left) {
    this.sprite.body.velocity.x = -this.SPEED;
  } else if (this.input.keys.right) {
    this.sprite.body.velocity.x = this.SPEED;
  } else {
    this.sprite.body.velocity.x = 0;
  }

  if (this.sprite.x < -this.sprite.width) {
    this.sprite.x = game.world.width;
  } else if (this.sprite.x > game.world.width) {
    this.sprite.x = -this.sprite.width;
  } else if (this.sprite.y < -this.sprite.height) {
    this.sprite.y = game.world.height;
  } else if (this.sprite.y > game.world.height) {
    this.sprite.y = -this.sprite.height;
  }
};
