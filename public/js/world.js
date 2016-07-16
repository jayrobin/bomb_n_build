function World() {
  this.map = game.add.tilemap();
  this.map.addTilesetImage('tiles');
  this.tiles = this.map.create('layer1', 10, 10, 32, 32);
}

World.prototype.setTiles = function(tileArr) {
  for(var y = 0; y < tileArr.length; y++) {
    var row = tileArr[y];
    for(var x = 0; x < row.length; x++) {
      this.map.putTile(row[x], x, y, this.tiles);
    }
  }
}