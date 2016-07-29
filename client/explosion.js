function Explosion(x, y) {
  Phaser.Sprite.call(this, game, x, y, 'explosion');
  this.setupAnimations();
  this.init(x, y);
  game.physics.arcade.enable(this);
};

Explosion.prototype = Object.create(Phaser.Sprite.prototype);
Explosion.prototype.constructor = Explosion;

Explosion.prototype.setupAnimations = function() {
  var anim = this.animations.add('explode');
  anim.killOnComplete = true;
};

Explosion.prototype.init = function(x, y) {
  this.reset(x, y);
  this.animations.play('explode');
};

Explosion.prototype.remove = function() {
  this.kill();
};