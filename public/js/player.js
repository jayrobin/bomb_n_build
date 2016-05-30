function Player() {}

Player.prototype.initialize = function() {
  this.SPEED = 100;
  this.setupInput();
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
