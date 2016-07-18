const events = require('./events');
const Subject = require('./subject');

const DELAY = 3000;

function Bomb(id, x, y, world) {
  Subject.call(this);
  this.pos = { x, y };
  this.id = id;
  this.world = world;
  this.fuse = DELAY;
  this.active = true;
}

Bomb.prototype = Object.create(Subject.prototype);
Bomb.prototype.constructor = Bomb;

Bomb.prototype.update = function() {
  if (this.active) {
    this.fuse -= this.world.getElapsed();

    if (this.fuse <= 0) {
      this.active = false;
      this.notify(this, events.BOMB.EXPLODE);
    }
  }
};

module.exports = Bomb;
