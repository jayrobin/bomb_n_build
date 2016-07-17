var playState = {
  create: function() {
    this.running = false;
    this.players = [];
    this.world = new World();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Client.connect(this);
  },
  setMap: function(mapData) {
    this.world.setTiles(mapData);
    this.bombs = game.add.group();
  },
  update: function() {
    if (this.running) {
      this.player.update();

      this.players.forEach(function(player) {
        player.update();
      });

      this.game.physics.arcade.collide(this.player.sprite, this.world.tiles);
    }
  },
  createPlayer: function(x, y) {
    this.player = new LocalPlayer(x, y, this);
    game.camera.follow(this.player.sprite);
  },
  createNetPlayer: function(id, x, y) {
    var player = new NetPlayer(id, x, y);
    this.players.push(player);
  },
  findPlayerById(id) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      if (player.id === id) {
        return player;
      }
    }
  },
  removeNetPlayer: function(id) {
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];

      if (player.id === id) {
        this.players.splice(i, 1);
        player.remove();
        return;
      }
    }
  },
  addBomb: function(id, x, y) {
    var bomb = this.bombs.getFirstDead();

    if (!bomb) {
      this.bombs.add(new Bomb(id, x, y));
    } else {
      bomb.init(id, x, y);
    }
  },
  removeBomb: function(id) {
    this.bombs.forEach(function(bomb) {
      if (bomb.id === id) {
        bomb.remove();
        return;
      }
    });
  },
  start: function() {
    this.running = true;
  }
};
