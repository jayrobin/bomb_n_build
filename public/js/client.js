var Client = {
  connect: function(game) {
    this.game = game;
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID);
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
  },
  handleRegisterID: function(id) {
    console.log("Registering ID: " + id);
    this.id = id;
  },
  handleSetInitialPos: function(pos) {
    console.log("Setting initial pos: " + pos.x + ", " + pos.y);
    this.game.createPlayer(pos.x, pos.y);
    this.game.start();
  },
  handleMapState: function(map) {
    this.game.setMap(map);
  },
  handleAddPlayer: function(id, pos) {
    console.log("Adding net player " + id + " (" + pos.x + ", " + pos.y + ")");
    this.game.createNetPlayer(id, pos.x, pos.y);
  },
  handleCurrentPlayers: function(players) {
    players.forEach(function(player) {
      this.handleAddPlayer(player.id, player.pos);
    }.bind(this));
  },
  handleRemovePlayer: function(id) {
    console.log("Removing net player " + id);
    this.game.removeNetPlayer(id);
  },
  handleUpdateInput: function(id, input) {
    var player = this.game.findPlayerById(id);
    if (player) {
      player.updateInput(input);
    }
  },
  handleDropBomb: function(id, pos) {
    this.game.addBomb(id, pos.x, pos.y);
  },
  handleCurrentBombs: function(bombs) {
    bombs.forEach(function(bomb) {
      this.handleDropBomb(bomb.id, bomb.pos);
    }.bind(this));
  },
  handleRemoveBomb: function(id) {
    console.log("Removing bomb " + id);
    this.game.removeBomb(id);
  },
  handleSetTile: function(pos, tileState) {
    console.log("Setting tile " + pos.x + ", " + pos.y + " (" + tileState + ")");
    this.game.setTile(pos.x, pos.y, tileState);
  },
  updateInput: function(input, pos) {
    this.socket.emit('update_input', input, pos);
  },
  dropBomb: function(x, y) {
    this.socket.emit('drop_bomb', { x: x, y: y });
  },
  upgradeTile: function(x, y, direction) {
    this.socket.emit('upgrade_tile', { x: x, y: y }, direction);
  }
};
