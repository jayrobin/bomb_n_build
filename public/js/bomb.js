function Bomb(id, x, y) {
  this.id = id;
  this.sprite = game.add.sprite(x, y, 'bomb');
  game.physics.arcade.enable(this.sprite);
  this.sprite.anchor.setTo(0.5, 0.5);
}