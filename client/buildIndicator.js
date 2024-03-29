function BuildIndicator(gridX, gridY) {
  Phaser.Sprite.call(this, game, gridX * 32, gridY * 32, 'buildIndicator');
  this.setupAnimations();
  this.init(gridX, gridY);
};

BuildIndicator.prototype = Object.create(Phaser.Sprite.prototype);
BuildIndicator.prototype.constructor = BuildIndicator;

BuildIndicator.prototype.init = function(gridX, gridY) {
  this.pos = { x: gridX, y: gridY };
  this.reset(gridX * 32, gridY * 32);
  this.animations.stop(null, true);
  this.animations.play('build');
};

BuildIndicator.prototype.setupAnimations = function() {
  var anim = this.animations.add('build');
  anim.killOnComplete = true;
};

BuildIndicator.prototype.setSpeed = function(time, totalTime, speed) {
  if (speed === 0) {
    this.kill();
  } else {
    this.animations.stop(null, true);
    this.animations.currentAnim.delay = (totalTime / this.animations.frameTotal) / speed;
    this.animations.play('build');
    this.animations.currentAnim.setFrame(Math.round((time / totalTime) * this.animations.frameTotal));
  }
};

module.exports = BuildIndicator;
