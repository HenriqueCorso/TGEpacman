import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { isTileFree } from './pacman-utils.js';
import { map } from './myMap.js';
import { preloadImages } from './engine/utils.js';
import { Flipbook } from './engine/flipbook.js';

class Pacman extends Player {
  constructor() {
    super({
      name: 'pacman',
      owner: Engine.gameLoop,
      hasColliders: true,
      scale: 0.2,
      position: V2(150, 300),
      rotation: Math.PI
    });


    const circlePlayer = new Circle(V2(0, 0), 100);
    this.movement.acceleration = 0;
    this.movementType = Enum_PlayerMovement.None;
    this.colliders.add(circlePlayer);
    this.attachKeyboard();
    this.setCollisionResponse('Obstacle', TGE.Enum_HitTestMode.Overlap);
  }

  tick() {
    super.tick();
    const keys = this.controllers['keyboard'].keyState;
    const tileSize = 50;

    //check if player is exactly dead center over a tile (because that's the only situation when he's allowed to change directions!) otherwise he could be going partially over a block
    const isPlayerMiddleOfTile = ((this.position.x % tileSize == 0) && (this.position.y % tileSize == 0));

    //Rule #1 player is allowed to change direction only whne he's in the middle of a tile (this rule can be further refined)
    if (isPlayerMiddleOfTile) {
      if (keys.left && this.position.y % 50 == 0) this.data.desiredDirection = 1;
      if (keys.right && this.position.y % 50 == 0) this.data.desiredDirection = 2;
      if (keys.up && this.position.x % 50 == 0) this.data.desiredDirection = 3;
      if (keys.down && this.position.x % 50 == 0) this.data.desiredDirection = 4;
    }
    // save a copy of player's current position to se if rule #2 will result in player movement
    let oldPos = this.position.clone();

    // Rule #2 move player to desired direction if the tile in the direction of movement is free
    if (this.data.desiredDirection == 1 && isTileFree(this.position, V2(-1, 0), tileSize)) this.position.x--;
    if (this.data.desiredDirection == 2 && isTileFree(this.position, V2(1, 0), tileSize)) this.position.x++;
    if (this.data.desiredDirection == 3 && isTileFree(this.position, V2(0, -1), tileSize)) this.position.y--;
    if (this.data.desiredDirection == 4 && isTileFree(this.position, V2(0, 1), tileSize)) this.position.y++;

    // Rule #3 if player did not move in any direction dureng last frame, it has hit a block and thus not allowed to continue movemnt
    if (Vec2.IsEqual(oldPos, this.position, 0.5)) this.data.desiredDirection = -1

    // Update the Pacman's move animation based on the player's movement
    if (this.data.desiredDirection !== -1) {
      if (this.data.desiredDirection === 2) {
        this.rotation = 0;
      } else if (this.data.desiredDirection === 1) {
        this.rotation = Math.PI;
      } else if (this.data.desiredDirection === 4) {
        this.rotation = Math.PI / 2;
      } else if (this.data.desiredDirection === 3) {
        this.rotation = -Math.PI / 2;
      }
    }
  }
}



export { Pacman };
