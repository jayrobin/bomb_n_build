'use strict';

const events = require('./events');
const Subject = require('./subject');

const BUILD_DELAYS = [0, 0, 1500, 1500, 1500, 3000, 6000, 15000, 30000];

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

Tile.TYPE = {
  FIXED: 0,
  SAFE: 1,
  HOLE: 2,
  DAMAGE_HIGH: 3,
  DAMAGE_LOW: 4,
  FLOOR: 5,
  WALL_1: 6,
  WALL_2: 7,
  WALL_3: 8,
  WALL_4: 9
};


Tile.prototype.getBuildInfo = function() {
  return {
    time: this.buildTimer,
    totalTime: BUILD_DELAYS[this.type],
    speed: this.numBuilders
  }
};

Tile.prototype.damage = function(amount) {
  if (this.type !== Tile.TYPE.FIXED && this.type !== Tile.TYPE.SAFE && this.type !== Tile.TYPE.HOLE) {
    this.type = Math.max(Tile.TYPE.HOLE, this.type - amount);
    return true;
  }
  return false;
};

Tile.prototype.isUpgradable = function() {
  return this.type !== Tile.TYPE.FIXED && this.type !== Tile.TYPE.SAFE && Tile.type !== Tile.TYPE.WALL_4;
};

Tile.prototype.upgrade = function() {
  switch(this.type) {
    case Tile.TYPE.HOLE:
    case Tile.TYPE.DAMAGE_HIGH:
    case Tile.TYPE.DAMAGE_LOW:
      this.type = Tile.TYPE.FLOOR;
    break;

    case Tile.TYPE.FLOOR:
    case Tile.TYPE.WALL_1:
    case Tile.TYPE.WALL_2:
    case Tile.TYPE.WALL_3:
      this.type += 1;
    break;
  }
  this.buildTimer = 0;
  return this.type;
};

Tile.prototype.isPassable = function(compareTile) {
  if (this === compareTile) {
    return true;
  }

  if (!!this.bomb) {
    return false;
  }

  switch(this.type) {
    case Tile.TYPE.SAFE:
    case Tile.TYPE.FLOOR:
    case Tile.TYPE.DAMAGE_HIGH:
    case Tile.TYPE.DAMAGE_LOW:
      return true;
    break;

    case Tile.TYPE.FIXED:
    case Tile.TYPE.HOLE:
    case Tile.TYPE.WALL_1:
    case Tile.TYPE.WALL_2:
    case Tile.TYPE.WALL_3:
      return false;
    break;
  }
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
    this.buildTimer += this.world.getElapsed();
    if (this.buildTimer >= BUILD_DELAYS[this.type]) {
      this.upgrade();
      this.notify(this, events.TILE.UPGRADE);
    }
  }
};

module.exports = Tile;
