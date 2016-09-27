function World() {
  this.map = game.add.tilemap();
  this.map.addTilesetImage('tiles');
}

World.prototype.setTiles = function(tileArr) {
  var height = tileArr.length;
  var width = tileArr[0].length;

  this.tiles = this.map.create('map', width, height, 32, 32);
  this.tiles.resizeWorld();


  for(var y = 0; y < height; y++) {
    var row = tileArr[y];
    for(var x = 0; x < width; x++) {
      this.setTile(x, y, row[x]);
    }
  }

  this.map.setCollision([0, 2, 6, 7, 8, 9], true, this.tiles);
};

World.prototype.setTile = function(x, y, tileState) {
  this.map.putTile(tileState, x, y, this.tiles);
};

module.exports = World;
