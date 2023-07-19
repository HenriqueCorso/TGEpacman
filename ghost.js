import { Enemy } from './engine/enemy.js';
import { Vector2 } from './engine/types.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { isTileFree } from './pacman-utils.js';


class Ghost extends Enemy {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      name: 'ghost',
      hasColliders: true,
      imgUrl: 'img/ghost.png',
      scale: 0.2,
      position: position
    });


    const circleGhost = new Circle(V2(0, 0), 100);
    this.colliders.add(circleGhost);
    this.colliderType = 'Enemy';
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore
    });
    this.events.add('beginoverlap', e => {
      console.log('DEAD!')
      // do something when player overlaps
      // the event object contains reference to both parties of the overlap
    });

    this.data.randomDirection = 0
  }

  tick() {
    const tileSize = 50;

    // Check if ghost is in the middle of a tile
    const isGhostMiddleOfTile = ((this.position.x % tileSize === 0) && (this.position.y % tileSize === 0));

    // Rule #1 ghost is allowed to change direction only when it's in the middle of a tile
    if (isGhostMiddleOfTile) {
      const validDirections = [];

      // Check if the tile to the left is free
      if (isTileFree(this.position, V2(-1, 0), tileSize)) { validDirections.push(1) }; // Add direction "left"

      // Check if the tile to the right is free
      if (isTileFree(this.position, V2(1, 0), tileSize)) { validDirections.push(2) }; // Add direction "right"

      // Check if the tile above is free
      if (isTileFree(this.position, V2(0, -1), tileSize)) { validDirections.push(3) }; // Add direction "up"

      // Check if the tile below is free
      if (isTileFree(this.position, V2(0, 1), tileSize)) { validDirections.push(4) }; // Add direction "down"


      // Choose a random valid direction
      const randomDirectionIndex = Math.floor(Math.random() * validDirections.length);
      this.data.randomDirection = validDirections[randomDirectionIndex];
    }
    // Move ghost in the chosen direction
    if (this.data.randomDirection === 1) {
      this.position.x -= 1;
    } else if (this.data.randomDirection === 2) {
      this.position.x += 1;
    } else if (this.data.randomDirection === 3) {
      this.position.y -= 1;
    } else if (this.data.randomDirection === 4) {
      this.position.y += 1;
    }
  }
}

export { Ghost };

