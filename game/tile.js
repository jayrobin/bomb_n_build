'use strict';

const events = require('./events');
const Subject = require('./subject');

const BUILD_DELAYS = [0, 1500, 1500, 1500, 3000, 6000, 15000, 30000];

function Tile(pos, type, world) {
  Subject.call(this);
  this.pos = pos;
  this.world = world;
  this.type = type;
  this.buildTimer = 0;
  this.numBuilders = 0;
}

Tile.prototype = Object.create(Subject.prototype);
Tile.prototype.constructor = Tile;

Tile.prototype.getBuildInfo = function() {
  return {
    time: this.buildTimer,
    totalTime: BUILD_DELAYS[this.type],
    speed: this.numBuilders
  }
};

Tile.prototype.damage = function(amount) {
  if (this.type > 1) {
    this.type = Math.max(1, this.type - amount);
    return this.type;
  }
  return -1;
};

Tile.prototype.upgrade = function() {
  if (this.type > 0) {
    if (this.type < 4) {
      this.type = 4;
    } else if (this.type < 8) {
      this.type += 1;
    }
  }
  this.buildTimer = 0;
  return this.type;
};

Tile.prototype.startBuilding = function() {
  this.numBuilders++;
};

Tile.prototype.stopBuilding = function() {
  this.numBuilders = Math.max(0, this.numBuilders - 1);
  if (this.numBuilders === 0) {
    this.buildTimer = 0;
  }
};

Tile.prototype.update = function() {
  if (this.numBuilders > 0) {
    this.buildTimer += this.world.getElapsed() * this.numBuilders;
    if (this.buildTimer >= BUILD_DELAYS[this.type]) {
      this.upgrade();
      this.notify(this, events.TILE.UPGRADE);
    }
  }
};

module.exports = Tile;
