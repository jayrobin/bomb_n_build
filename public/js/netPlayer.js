function NetPlayer(id, playerName, x, y, color, label) {
  Phaser.Sprite.call(this, game, x, y, 'enemy');
  this.tint = color;
  this.id = id;
  this.playerName = playerName;
  this.label = label;
  this.initialize();
}

NetPlayer.prototype = Object.create(Player.prototype);
NetPlayer.constructor = NetPlayer;

NetPlayer.prototype.remove = function() {
  this.kill();
};

NetPlayer.prototype.update = function() {
  this.updatePos();
  this.updateLabel();
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
