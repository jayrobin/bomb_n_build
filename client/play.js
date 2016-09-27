var LocalPlayer = require('./localPlayer');
var NetPlayer = require('./netPlayer');
var World = require('./world');
var Bomb = require('./bomb');
var Explosion = require('./explosion');
var Client = require('./client');
var BuildIndicator = require('./buildIndicator');

module.exports = {
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
    }
  },
  createPlayer: function(id, playerName, x, y, color) {
    this.player = new LocalPlayer(id, playerName, x, y, color, this.createPlayerLabel());
    this.players.add(this.player);
    game.camera.follow(this.player);
  },
  createNetPlayer: function(id, playerName, x, y, score, color) {
    var player = new NetPlayer(id, playerName, x, y, color, this.createPlayerLabel());
    this.players.add(player);
    this.setPlayerScore(player, score);
  },
  findPlayerById: function(id) {
    if (id === this.player.id) {
      return this.player;
    }

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
  handlePlayerDie: function(player, _explosion) {
    this.setPlayerScore(player, 0);
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
    this.setPlayerScore(this.player, 0);
    this.running = true;
  },
  setupUI: function() {
    this.respawnLabel = game.add.text(240, 170, "Press ENTER to respawn", { font: "32px Arial", fill: "#ffffff", align: "center" });
    this.respawnLabel.fixedToCamera = true;
    this.respawnLabel.anchor.setTo(0.5, 0.5);
    this.respawnLabel.visible = false;

    var spawnKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
    spawnKey.onDown.add(this.spawnPlayer, this);

    this.playerListLabel = game.add.text(240, 170, "", { font: "32px Arial", fill: "#ffffff", align: "center" });
    this.playerListLabel.fixedToCamera = true;
    this.playerListLabel.anchor.setTo(0.5, 0.5);
    this.playerListLabel.visible = false;

    var showAllPlayersKey = game.input.keyboard.addKey(Phaser.Keyboard.TAB);
    showAllPlayersKey.onDown.add(this.showPlayerList, this);
    showAllPlayersKey.onUp.add(this.hidePlayerList, this);

    this.highscoreLabel = game.add.text(0, 0, "", { font: "12px Arial", fill: "#ffffff", align: "left" });
    this.highscoreLabel.fixedToCamera = true;
    this.highscoreLabel.anchor.setTo(0, 0);
    this.highscoreLabel.visible = true;
  },
  setPlayerScore: function(player, score) {
    player.setScore(score);

    var sortedPlayers = this.players.children.sort(function(a, b) {
      return b.score - a.score;
    });

    var topPlayers = sortedPlayers.slice(-5);
    var playerList = "";
    topPlayers.forEach(function(player) {
      playerList += player.score + ' - ' + player.playerName + '\n';
    });

    this.highscoreLabel.text = playerList;
  },
  showDeathScreen: function() {
    this.respawnLabel.visible = true;
  },
  showPlayerList: function() {
    var playerList = "";
    this.players.forEach(function(player) {
      playerList += player.playerName + " (" + player.score + ")\n";
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
  },
  quit: function() {
    game.state.start('menu');
  }
};
