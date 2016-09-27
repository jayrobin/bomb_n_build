function Bomb(id, x, y, fuse) {
  Phaser.Sprite.call(this, game, x, y, 'bomb');
  game.physics.arcade.enable(this);
  this.body.immovable = true;
  this.setupAnimations();
  this.init(id, x, y, fuse);
};

Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.prototype.constructor = Bomb;

Bomb.prototype.init = function(id, x, y, fuse) {
  this.reset(x, y);
  this.id = id;
  this.animations.stop(null, true);
  this.animations.play('fuse');
  this.animations.currentAnim.delay = fuse / this.animations.frameTotal;
  this.animations.currentAnim.setFrame(0);
};

Bomb.prototype.setupAnimations = function() {
  var anim = this.animations.add('fuse');
};

Bomb.prototype.remove = function() {
  this.kill();
};

module.exports = Bomb;
