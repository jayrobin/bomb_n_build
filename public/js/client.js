var Client = {
  connect: function(game) {
    this.game = game;
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID);
    this.socket.on('set_initial_pos', this.handleSetInitialPos.bind(this));
    this.socket.on('add_player', this.handleAddPlayer.bind(this));
    this.socket.on('current_players', this.handleCurrentPlayers.bind(this));
    this.socket.on('remove_player', this.handleRemovePlayer.bind(this));
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
  updateInput: function(input) {
    this.socket.emit('update_input', input);
  }
};
