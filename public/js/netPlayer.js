function NetPlayer(id, x, y, color) {
  Phaser.Sprite.call(this, game, x, y, 'enemy');
  this.tint = color;
  this.initialize();
  this.id = id;
}

NetPlayer.prototype = Object.create(Player.prototype);
NetPlayer.constructor = NetPlayer;

NetPlayer.prototype.remove = function() {
  this.kill();
};

NetPlayer.prototype.update = function() {
  this.updatePos();
  this.updateAnim(this.body.velocity.x !== 0 || this.body.velocity.y !== 0);
};

NetPlayer.prototype.updateInput = function(input, pos) {
  if (input.keys) {
    this.input = input;
  }

  if (this.x !== pos.x || this.y != pos.y) {
    game.add.tween(this).to(pos, 250);
  }
};
