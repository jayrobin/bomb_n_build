function NetPlayer(id, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'enemy');
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

NetPlayer.prototype.updateInput = function(input) {
  if (input.keys) {
    this.input = input;
  }
};
