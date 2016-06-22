const DELAY = 300000;

function Bomb(x, y, id, world) {
  this.pos = { x: x, y: y };
  this.id = id;
  this.world = world;
  this.dropTime = world.getTime();
  this.fuse = DELAY;
}

Bomb.prototype.update = function() {
  this.fuse -= (this.world.getTime() - this.dropTime);

  if (this.fuse <= 0) {
    this.world.removeBomb(this.id);
  }
};

module.exports = Bomb;
