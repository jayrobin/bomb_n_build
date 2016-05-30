const DELAY = 3000;

function Bomb(x, y) {
  this.x = x;
  this.y = y;
  this.dropTime = process.hrtime()[1];
}

module.exports = Bomb;
