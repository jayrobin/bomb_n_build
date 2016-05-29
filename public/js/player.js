function Player(x, y) {
  this.sprite = game.add.sprite(x, y, 'player');
  game.physics.arcade.enable(this.sprite);
  this.cursor = game.input.keyboard.createCursorKeys();
  this.SPEED = 100;
  this.sprite.anchor.setTo(0.5, 0.5)
}

Player.prototype.update = function() {
  var horizCursorDown = false;
  var vertCursorDown = false;

  if (this.cursor.left.isDown) {
    this.sprite.body.velocity.x = -this.SPEED;
    horizCursorDown = true;
  } else if (this.cursor.right.isDown) {
    this.sprite.body.velocity.x = this.SPEED;
    horizCursorDown = true;
  } else {
    this.sprite.body.velocity.x = 0;
  }

  if (this.cursor.up.isDown) {
    this.sprite.body.velocity.y = -this.SPEED;
    vertCursorDown = true;
  } else if (this.cursor.down.isDown) {
    this.sprite.body.velocity.y = this.SPEED;
    vertCursorDown = true;
  } else {
    this.sprite.body.velocity.y = 0;
  }

  if (horizCursorDown && vertCursorDown) {
    this.sprite.body.velocity.y /= 1.5;
    this.sprite.body.velocity.x /= 1.5;
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
