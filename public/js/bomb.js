function Bomb(id, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'bomb');
  this.anchor.setTo(0.25, 0.25);
  this.init(id, x, y);
};

Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.prototype.constructor = Bomb;

Bomb.prototype.init = function(id, x, y) {
  this.reset(x, y);
  this.id = id;
};

Bomb.prototype.remove = function() {
  this.kill();
};