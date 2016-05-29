var Client = {
  connect: function(game) {
    this.game = game;
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID);
    this.socket.on('set_pos', this.handleSetPos.bind(this));
    this.socket.on('add_player', this.handleAddPlayer.bind(this));
  },
  handleRegisterID: function(id) {
    this.id = id;
  },
  handleSetPos: function(pos) {
    this.game.createPlayer(pos.x, pos.y);
    this.game.start();
  },
  handleAddPlayer: function(id, pos) {
    console.log(id, pos);
  }
};
