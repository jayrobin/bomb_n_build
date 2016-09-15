function Player() {}

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.initialize = function() {
  this.SPEED = 100;
  this.resetInput();
  this.setupAnimations();
  this.anchor.setTo(0.5, 0.5);
  game.physics.arcade.enable(this);
  this.body.setSize(24, 28, 4, 4);
  this.body.friction.x = 0;
  this.body.friction.y = 0;
  this.label.text = this.playerName;
};

Player.prototype.resetInput = function() {
  this.input = {
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  };
};

Player.prototype.respawn = function(x, y) {
  this.label.visible = true;
  this.reset(x, y);
};

Player.prototype.setupAnimations = function() {
  this.animations.add('up_idle', [0], 20, true, true);
  this.animations.add('up_walk', [1, 2], 20, true, true);
  this.animations.add('down_idle', [3], 20, true, true);
  this.animations.add('down_walk', [4, 5], 20, true, true);
  this.animations.add('left_idle', [6], 20, true, true);
  this.animations.add('left_walk', [7, 8], 20, true, true);
  this.animations.add('right_idle', [9], 20, true, true);
  this.animations.add('right_walk', [10, 11], 20, true, true);

  this.animations.play('down_idle');
};

Player.prototype.updateAnim = function(moving) {
  var direction = this.getDirectionAsString();

  if (moving) {
    this.animations.play(direction + '_walk');
  } else {
    this.animations.play(direction + '_idle');
  }
};

Player.prototype.updateLabel = function() {
  game.add.tween(this.label).to({ x: this.x, y: this.y }, 33).start();
};

Player.prototype.getDirection = function() {
  switch (this.body.facing) {
    case 1:
      return { x: -1, y: 0 };
      break;
    case 2:
      return { x: 1, y: 0 };
      break;
    case 3:
      return { x: 0, y: -1 };
      break;
    case 4:
      return { x: 0, y: 1 };
      break;
    default:
      return { x: 0, y: 0 };
      break;
  }
};

Player.prototype.getDirectionAsString = function() {
  switch (this.body.facing) {
    case 1:
      return 'left';
      break;
    case 2:
      return 'right';
      break;
    case 3:
      return 'up';
      break;
    case 4:
      return 'down';
      break;
    default:
      return '';
      break;
  }
};

Player.prototype.die = function() {
  this.label.visible = false;
  this.kill();
};

Player.prototype.setPos = function(pos) {
  game.add.tween(this).to(pos, 33).start();
};
