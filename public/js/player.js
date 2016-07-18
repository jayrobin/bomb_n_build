function Player() {}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

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
    this.body.velocity.y = -this.SPEED;
  } else if (this.input.keys.down) {
    this.body.velocity.y = this.SPEED;
  } else {
    this.body.velocity.y = 0;
  }

  if (this.input.keys.left) {
    this.body.velocity.x = -this.SPEED;
  } else if (this.input.keys.right) {
    this.body.velocity.x = this.SPEED;
  } else {
    this.body.velocity.x = 0;
  }

  if (this.x < -this.width) {
    this.x = game.world.width;
  } else if (this.x > game.world.width) {
    this.x = -this.width;
  } else if (this.y < -this.height) {
    this.y = game.world.height;
  } else if (this.y > game.world.height) {
    this.y = -this.height;
  }
};
