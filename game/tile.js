function Tile(type) {
  this.type = type;
}

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
  return this.type;
};

module.exports = Tile;
