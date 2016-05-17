var Client = {
  connect: function() {
    this.socket = io();
    this.socket.on('register_id', this.handleRegisterID);
  },
  handleRegisterID: function(id) {
    this.id = id;
  }
};
