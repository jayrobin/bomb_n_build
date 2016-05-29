function NetPlayer(id, x, y) {
  this.id = id;
  this.sprite = game.add.sprite(x, y, 'enemy');
  this.sprite.anchor.setTo(0.5, 0.5)
}

NetPlayer.prototype.remove = function() {
  this.sprite.destroy();
};
