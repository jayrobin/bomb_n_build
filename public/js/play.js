var playState = {
  create: function() {
    this.running = false;
    this.world = new World();
    game.physics.startSystem(Phaser.Physics.ARCADE);
    Client.connect(this);
  },
  setMap: function(mapData) {
    this.world.setTiles(mapData);
    this.bombs = game.add.group();
    this.players = game.add.group();
    this.explosions = game.add.group();
  },
  update: function() {
    if (this.running) {
      this.player.update();

      this.players.forEach(function(player) {
        player.update();
      });

      this.game.physics.arcade.collide(this.players, this.world.tiles);
      this.game.physics.arcade.overlap(this.players, this.explosions, this.handlePlayerExplosionOverlap, null, this);
    }
  },
  createPlayer: function(x, y) {
    this.player = new LocalPlayer(x, y);
    this.players.add(this.player);
    game.camera.follow(this.player);
  },
  createNetPlayer: function(id, x, y) {
    var player = new NetPlayer(id, x, y);
    this.players.add(player);
  },
  findPlayerById(id) {
    return this.players.filter(function(player) {
      if (player.id === id) {
        return player;
      }
    }).first;
  },
  removeNetPlayer: function(id) {
    var player = this.findPlayerById(id);
    if (player) {
      player.remove();
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
  addExplosion: function(x, y) {
    var explosion = this.explosions.getFirstDead();

    if (!explosion) {
      this.explosions.add(new Explosion(x, y));
    } else {
      explosion.init(x, y);
    }
  },
  handlePlayerExplosionOverlap: function(player, _explosion) {
    player.kill();
  },
  setTile: function(x, y, tileState) {
    this.world.setTile(x, y, tileState);
  },
  start: function() {
    this.running = true;
  }
};
