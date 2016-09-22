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
    this.updateInput();
    this.updateLabel();
  }
};

LocalPlayer.prototype.updateInput = function(force) {
  var inputDelta = {
    keys: {}
  };
  var update = false;

  if (this.inputState.keys.up !== this.cursor.up.isDown) {
    this.inputState.keys.up = inputDelta.keys.up = this.cursor.up.isDown;
    this.body.facing = Phaser.UP;
    if (this.inputState.keys.down) {
      this.inputState.keys.down = inputDelta.keys.down = false;
    }
    update = true;
  } else if (this.inputState.keys.down !== this.cursor.down.isDown) {
    this.body.facing = Phaser.DOWN;
    if (!this.inputState.keys.up) {
      this.inputState.keys.down = inputDelta.keys.down = this.cursor.down.isDown;
      update = true;
    }
  }
  if (this.inputState.keys.left !== this.cursor.left.isDown) {
    this.inputState.keys.left = inputDelta.keys.left = this.cursor.left.isDown;
    this.body.facing = Phaser.LEFT;
    if (this.inputState.keys.right) {
      this.inputState.keys.right = inputDelta.keys.right = false;
    }
    update = true;
  } else if (this.inputState.keys.right !== this.cursor.right.isDown) {
    this.body.facing = Phaser.RIGHT;
    if (!this.inputState.keys.left) {
      this.inputState.keys.right = inputDelta.keys.right = this.cursor.right.isDown;
      update = true;
    }
  }

  if (update) {
    Client.updateInput(inputDelta);
  } else if (force) {
    var forcedKeys = { keys: {} };
    if (this.cursor.up.isDown) {
      forcedKeys.keys.up = true;
    } else if (this.cursor.down.isDown) {
      forcedKeys.keys.down = true;
    }
    if (this.cursor.left.isDown) {
      forcedKeys.keys.left = true;
    } else if (this.cursor.right.isDown) {
      forcedKeys.keys.right = true;
    }
    Client.updateInput(forcedKeys);
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
    Client.startBuilding(this.getDirection());
  }
};

LocalPlayer.prototype.stopBuilding = function() {
  if (this.alive) {
    this.building = false;
    this.updateInput(true);
    Client.stopBuilding(this.getDirection());
  }
};
