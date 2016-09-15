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
  this.updateLabel();
  this.updateAnim(this.body.velocity.x !== 0 || this.body.velocity.y !== 0);
};

NetPlayer.prototype.updateInput = function(input, pos) {
  if (input.keys) {
    Object.assign(this.input.keys, input.keys);
  }

  if (this.x !== pos.x && (input.keys.left || input.keys.right)) {
    this.x = pos.x;
  }

  if (this.y !== pos.y && (input.keys.up || input.keys.down)) {
    this.y = pos.y;
  }
};
