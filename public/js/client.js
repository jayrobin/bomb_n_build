var Client = {
  connect: function() {
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID);
    this.socket.on('set_pos', this.handleSetPos);
  },
  handleRegisterID: function(id) {
    this.id = id;
  },
  handleSetPos: function(pos) {
    console.log(pos);
  }
};
