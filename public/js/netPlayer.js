function NetPlayer(id, x, y) {
  this.initialize();
  this.id = id;
  this.sprite = game.add.sprite(x, y, 'enemy');
  game.physics.arcade.enable(this.sprite);
  this.sprite.anchor.setTo(0.5, 0.5);
}

NetPlayer.prototype = new Player();
NetPlayer.constructor = NetPlayer;

NetPlayer.prototype.remove = function() {
  this.sprite.destroy();
};

NetPlayer.prototype.update = function() {
  this.updatePos();
};

NetPlayer.prototype.updateInput = function(input) {
  if (input.keys) {
    this.input = input;
  }
};
