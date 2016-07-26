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
    this.buildIndicators = game.add.group();
    this.playerLabels = game.add.group();
    this.setupUI();
  },
  update: function() {
    if (this.running) {
      this.player.update();

      this.players.forEach(function(player) {
        player.update();
      });

      this.game.physics.arcade.collide(this.players, this.world.tiles);
      this.game.physics.arcade.collide(this.players, this.bombs);
      this.game.physics.arcade.overlap(this.players, this.explosions, this.handlePlayerExplosionOverlap, null, this);
    }
  },
  createPlayer: function(id, playerName, x, y, color) {
    this.player = new LocalPlayer(id, playerName, x, y, color, this.createPlayerLabel());
    this.players.add(this.player);
    game.camera.follow(this.player);
  },
  createNetPlayer: function(id, playerName, x, y, color) {
    var player = new NetPlayer(id, playerName, x, y, color, this.createPlayerLabel());
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
      player.label.destroy();
      player.remove();
    }
  },
  createPlayerLabel: function() {
    var playerLabel = game.add.text(0, 0, "", { font: "10px Arial", fill: "#ffffff", align: "center" });
    playerLabel.anchor.setTo(0.5, 1.5);
    this.playerLabels.add(playerLabel);

    return playerLabel;
  },
  addBomb: function(id, x, y, fuse) {
    var bomb = this.bombs.getFirstDead();

    if (!bomb) {
      this.bombs.add(new Bomb(id, x, y, fuse));
    } else {
      bomb.init(id, x, y, fuse);
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
  addBuildIndicator: function(gridX, gridY) {
    var buildIndicator = this.buildIndicators.getFirstDead();

    if (!buildIndicator) {
      buildIndicator = new BuildIndicator(gridX, gridY);
      this.buildIndicators.add(buildIndicator);
    } else {
      buildIndicator.init(gridX, gridY);
    }

    return buildIndicator;
  },
  handlePlayerExplosionOverlap: function(player, _explosion) {
    if (player === this.player) {
      this.player.stopBuilding();
      this.showDeathScreen();
    }
    player.die();
  },
  setTile: function(x, y, tileState) {
    this.world.setTile(x, y, tileState);
  },
  setBuildIndicator: function(x, y, time, totalTime, speed) {
    var indicator = this.buildIndicators.filter(function(ind) {
      if (ind.alive && x === ind.pos.x && y === ind.pos.y) {
        return ind;
      }
    }).first;

    if (!indicator) {
      indicator = this.addBuildIndicator(x, y);
    }

    indicator.setSpeed(time, totalTime, speed);
  },
  start: function() {
    this.running = true;
  },
  setupUI: function() {
    this.respawnLabel = game.add.text(240, 170, "Press ENTER to respawn", { font: "32px Arial", fill: "#ffffff", align: "center" });
    this.respawnLabel.fixedToCamera = true;
    this.respawnLabel.anchor.setTo(0.5, 0.5);
    this.respawnLabel.visible = false;

    var spawnKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    spawnKey.onDown.add(this.spawnPlayer, this);

    this.playerListLabel = game.add.text(240, 170, "Test", { font: "32px Arial", fill: "#ffffff", align: "center" });
    this.playerListLabel.fixedToCamera = true;
    this.playerListLabel.anchor.setTo(0.5, 0.5);
    this.playerListLabel.visible = false;

    var showAllPlayersKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    showAllPlayersKey.onDown.add(this.showPlayerList, this);
    showAllPlayersKey.onUp.add(this.hidePlayerList, this);
  },
  showDeathScreen: function() {
    this.respawnLabel.visible = true;
  },
  showPlayerList: function() {
    var playerList = "";
    this.players.forEach(function(player) {
      playerList += player.playerName + "\n";
    });
    this.playerListLabel.text = playerList;
    this.playerListLabel.visible = true;
  },
  hidePlayerList: function() {
    this.playerListLabel.visible = false;
  },
  spawnPlayer: function() {
    if (!this.player.alive) {
      this.respawnLabel.visible = false;
      this.player.initRespawn();
    }
  }
};
