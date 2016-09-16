var Client = {
  connect: function(game) {
    this.game = game;
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID.bind(this));
    this.socket.on('set_initial_pos', this.handleSetInitialPos.bind(this));
    this.socket.on('add_player', this.handleAddPlayer.bind(this));
    this.socket.on('map_state', this.handleMapState.bind(this));
    this.socket.on('current_players', this.handleCurrentPlayers.bind(this));
    this.socket.on('current_bombs', this.handleCurrentBombs.bind(this));
    this.socket.on('remove_player', this.handleRemovePlayer.bind(this));
    this.socket.on('update_input', this.handleUpdateInput.bind(this));
    this.socket.on('drop_bomb', this.handleDropBomb.bind(this));
    this.socket.on('remove_bomb', this.handleRemoveBomb.bind(this));
    this.socket.on('set_tile', this.handleSetTile.bind(this));
    this.socket.on('create_explosions', this.handleCreateExplosions.bind(this));
    this.socket.on('player_respawn', this.handlePlayerRespawn.bind(this));
    this.socket.on('set_tile_build_speed', this.handleSetTileBuildSpeed.bind(this));
    this.socket.on('current_building_tiles', this.handleCurrentBuildingTiles.bind(this));
    this.socket.on('set_pos', this.handleSetPos.bind(this));
    this.socket.on('set_player_pos', this.handleSetPlayerPos.bind(this));
  },
  handleRegisterID: function(id) {
    console.log("Registering ID: " + id);
    this.id = id;
    this.socket.emit('set_name', playerName);
  },
  handleSetInitialPos: function(pos, playerName, color) {
    console.log("Setting initial pos: " + pos.x + ", " + pos.y);
    this.game.createPlayer(this.id, playerName, pos.x, pos.y, color);
    this.game.start();
  },
  handleMapState: function(map) {
    this.game.setMap(map);
  },
  handleAddPlayer: function(id, playerName, pos, color) {
    console.log("Adding net player " + playerName + " (" + pos.x + ", " + pos.y + ") - " + color);
    this.game.createNetPlayer(id, playerName, pos.x, pos.y, color);
  },
  handleCurrentPlayers: function(players) {
    players.forEach(function(player) {
      this.handleAddPlayer(player.id, player.playerName, player.pos, player.color);
    }, this);
  },
  handleRemovePlayer: function(id) {
    console.log("Removing net player " + id);
    this.game.removeNetPlayer(id);
  },
  handleUpdateInput: function(id, input, pos) {
    var player = this.game.findPlayerById(id);
    if (player) {
      player.updateInput(input, pos);
    }
  },
  handleDropBomb: function(id, pos, fuse) {
    this.game.addBomb(id, pos.x, pos.y, fuse);
  },
  handleCurrentBombs: function(bombs) {
    bombs.forEach(function(bomb) {
      this.handleDropBomb(bomb.id, bomb.pos, bomb.fuse);
    }, this);
  },
  handleRemoveBomb: function(id) {
    console.log("Removing bomb " + id);
    this.game.removeBomb(id);
  },
  handleSetTile: function(pos, tileState) {
    console.log("Setting tile " + pos.x + ", " + pos.y + " (" + tileState + ")");
    this.game.setTile(pos.x, pos.y, tileState);
  },
  handleSetTileBuildSpeed: function(pos, buildInfo) {
    this.game.setBuildIndicator(pos.x, pos.y, buildInfo.time, buildInfo.totalTime, buildInfo.speed);
  },
  handleCreateExplosions: function(explosions) {
    explosions.forEach(function(explosion) {
      this.game.addExplosion(explosion.x, explosion.y);
    }, this);
  },
  handlePlayerRespawn: function(id, pos) {
    var player = this.game.findPlayerById(id);
    player.respawn(pos.x, pos.y);
  },
  updateInput: function(input) {
    this.socket.emit('update_input', input);
  },
  dropBomb: function() {
    this.socket.emit('drop_bomb');
  },
  respawn: function() {
    this.socket.emit('respawn');
  },
  startBuilding: function(direction) {
    this.socket.emit('start_building', direction);
  },
  stopBuilding: function(direction) {
    this.socket.emit('stop_building', direction);
  },
  handleCurrentBuildingTiles: function(tiles) {
    tiles.forEach(function(tile) {
      this.game.setBuildIndicator(tile.pos.x, tile.pos.y, tile.buildInfo.time, tile.buildInfo.totalTime, tile.buildInfo.speed);
    }.bind(this));
  },
  handleSetPos: function(pos) {
    this.game.player.setPos(pos);
  },
  handleSetPlayerPos: function(id, pos) {
    var player = this.game.findPlayerById(id);
    player.setPos(pos);
  }
};
