function LocalPlayer(id, playerName, x, y, color, label) {
  Phaser.Sprite.call(this, game, x, y, 'player');
  this.tint = color;
  this.id = id;
  this.playerName = playerName;
  this.label = label;
  this.cursor = game.input.keyboard.createCursorKeys();
  this.initialize();
  this.setupControls();
}

LocalPlayer.prototype = Object.create(Player.prototype);
LocalPlayer.constructor = LocalPlayer;

LocalPlayer.prototype.setupControls = function() {
  var dropBomb = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  dropBomb.onDown.add(this.dropBomb, this);

  var buildKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);
  buildKey.onDown.add(this.onBuildKeyDown, this);
  buildKey.onUp.add(this.stopBuilding, this);
};

LocalPlayer.prototype.update = function() {
  if (this.alive) {
    this.updateInput(this.building);
    this.updatePos();
    this.updateLabel();
    this.updateAnim(this.input.keys.up ||
                    this.input.keys.down ||
                    this.input.keys.left ||
                    this.input.keys.right);
  }
};

LocalPlayer.prototype.updateInput = function(stop) {
  var inputDelta = {
    keys: {}
  };

  var update = false;

  if (stop) {
    update = true;
    this.resetInput();
  } else {
    if (this.input.keys.up !== this.cursor.up.isDown) {
      this.input.keys.up = inputDelta.keys.up = this.cursor.up.isDown;
      update = true;
    }
    if (this.input.keys.down !== this.cursor.down.isDown) {
      this.input.keys.down = inputDelta.keys.down = this.cursor.down.isDown;
      update = true;
    }
    if (this.input.keys.left !== this.cursor.left.isDown) {
      this.input.keys.left = inputDelta.keys.left = this.cursor.left.isDown;
      update = true;
    }
    if (this.input.keys.right !== this.cursor.right.isDown) {
      this.input.keys.right = inputDelta.keys.right = this.cursor.right.isDown;
      update = true;
    }
  }

  if (update) {
    Client.updateInput(this.input, { x: this.x, y: this.y });
  }
};

LocalPlayer.prototype.dropBomb = function() {
  if (this.alive) {
    Client.dropBomb(this.x, this.y);
  }
};

LocalPlayer.prototype.initRespawn = function() {
  Client.respawn();
};

LocalPlayer.prototype.onBuildKeyDown = function() {
  if (this.alive) {
    this.building = true;
    Client.startBuilding(this.x, this.y, this.getDirection());
  }
};

LocalPlayer.prototype.stopBuilding = function() {
  if (this.alive) {
    this.building = false;
    Client.stopBuilding(this.x, this.y, this.getDirection());
  }
};
