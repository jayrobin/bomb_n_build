var Player = require('./player');

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
};

NetPlayer.prototype.updateInput = function(input, pos) {
  if (input.keys) {
    Object.assign(this.inputState.keys, input.keys);
  }

  if (this.x !== pos.x && (input.keys.left || input.keys.right)) {
    this.x = pos.x;
  }

  if (this.y !== pos.y && (input.keys.up || input.keys.down)) {
    this.y = pos.y;
  }
};

module.exports = NetPlayer;
