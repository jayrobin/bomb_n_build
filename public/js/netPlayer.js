function NetPlayer(id, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'enemy');
  this.initialize();
  this.id = id;
  game.physics.arcade.enable(this);
  this.anchor.setTo(0.5, 0.5);
}

NetPlayer.prototype = Object.create(Player.prototype);
NetPlayer.constructor = NetPlayer;

NetPlayer.prototype.remove = function() {
  this.kill();
};

NetPlayer.prototype.update = function() {
  this.updatePos();
};

NetPlayer.prototype.updateInput = function(input) {
  if (input.keys) {
    this.input = input;
  }
};
