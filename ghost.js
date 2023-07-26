import { Enemy } from './engine/enemy.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { Flipbook } from './engine/flipbook.js';
import { stopAndHideFlipbook, playAndShowFlipbook } from './pacman-utils.js';


class Ghost extends Enemy {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      name: 'ghost',
      hasColliders: true,
      scale: 0.13,
      position: position,
    });
  }

  init = async (flipbookName) => {
    const circleGhost = new Circle(V2(0, 0), 100);
    this.colliders.add(circleGhost);
    this.colliderType = 'Enemy';

    this.data.isScared = false; // New flag to indicate if the ghost is scared

    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore,
    });
    this.events.add('beginoverlap', (e) => {
      if (this.isScared) {
        // Destroy the ghost if it's scared and collided with the Pacman
        this.destroy();
        console.log('Ghost destroyed by Pacman');
      } else {
        this.handleCollisionWithPacman();
      }
    });

    this.data.randomDirection = 0;
    this.data.previousDirection = 0;

    Engine.addActor(this);

    this.flags.isFlipbookEnabled = true;


    // ghost moving flipbook
    const ghostFB = new Flipbook({ dims: V2(3, 3), actor: this, fps: 10 });
    await ghostFB.loadAsAtlas(flipbookName);
    ghostFB.addSequence({ name: 'GhostMoving', startFrame: 0, endFrame: 7, loop: true });
    ghostFB.play('GhostMoving');


    // ghost1 scared flipbook
    const ghostFBS = new Flipbook({ dims: V2(3, 3), actor: this, fps: 10 });
    await ghostFBS.loadAsAtlas('img/ghostMovingScared.png');
    ghostFBS.addSequence({ name: 'ScaredGhostMoving', startFrame: 0, endFrame: 7, loop: true });


  };


  handleCollisionWithPacman() {
    const player = Engine.gameLoop.findActorByName('pacman');

    console.log('DEAD!');
    player.handleCollisionWithGhost(); // Call the method in the player class to handle collision
    // Stop and hide the player's normal flipbook
    stopAndHideFlipbook(player, 0);
    // Play and show the player's dead flipbook
    playAndShowFlipbook(player, 1, 'PacmanDead');

  }

  moveGhost() {
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

  chooseRandomDirection() {
    const map = this.owner.data.map;
    const tileSize = 50;

    const validDirections = [];

    // Check if the tile to the left is free and not the previous direction
    if (map.isTileFree(this.position, V2(-1, 0), tileSize) && this.data.previousDirection !== 2) {
      validDirections.push(1); // Add direction "left"
    }

    // Check if the tile to the right is free and not the previous direction
    if (map.isTileFree(this.position, V2(1, 0), tileSize) && this.data.previousDirection !== 1) {
      validDirections.push(2); // Add direction "right"
    }

    // Check if the tile above is free and not the previous direction
    if (map.isTileFree(this.position, V2(0, -1), tileSize) && this.data.previousDirection !== 4) {
      validDirections.push(3); // Add direction "up"
    }

    // Check if the tile below is free and not the previous direction
    if (map.isTileFree(this.position, V2(0, 1), tileSize) && this.data.previousDirection !== 3) {
      validDirections.push(4); // Add direction "down"
    }

    // Choose a random valid direction
    const randomDirectionIndex = Math.floor(Math.random() * validDirections.length);
    this.data.randomDirection = validDirections[randomDirectionIndex];
  }

  checkValidDirectionsTowardsPlayer() {
    const map = this.owner.data.map;
    const player = Engine.gameLoop.findActorByName('pacman');
    const playerPosition = player.position;

    const validDirectionsTowardsPlayer = [];
    const tileSize = 50;

    // Check if the tile to the left is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(-1, 0), tileSize) &&
      this.data.previousDirection !== 2 &&
      playerPosition.x < this.position.x
    ) {
      validDirectionsTowardsPlayer.push(1); // Add direction "left"
    }

    // Check if the tile to the right is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(1, 0), tileSize) &&
      this.data.previousDirection !== 1 &&
      playerPosition.x > this.position.x
    ) {
      validDirectionsTowardsPlayer.push(2); // Add direction "right"
    }

    // Check if the tile above is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(0, -1), tileSize) &&
      this.data.previousDirection !== 4 &&
      playerPosition.y < this.position.y
    ) {
      validDirectionsTowardsPlayer.push(3); // Add direction "up"
    }

    // Check if the tile below is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(0, 1), tileSize) &&
      this.data.previousDirection !== 3 &&
      playerPosition.y > this.position.y
    ) {
      validDirectionsTowardsPlayer.push(4); // Add direction "down"
    }

    return validDirectionsTowardsPlayer;
  }

  moveAwayFromPlayer() {
    const map = this.owner.data.map;
    const player = Engine.gameLoop.findActorByName('pacman');
    const playerPosition = player.position;

    const validDirectionsAwayFromPlayer = [];
    const tileSize = 50;

    // Check if the tile to the left is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(-1, 0), tileSize) &&
      this.data.previousDirection !== 2 &&
      playerPosition.x > this.position.x
    ) {
      validDirectionsAwayFromPlayer.push(1); // Add direction "left"
    }

    // Check if the tile to the right is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(1, 0), tileSize) &&
      this.data.previousDirection !== 1 &&
      playerPosition.x < this.position.x
    ) {
      validDirectionsAwayFromPlayer.push(2); // Add direction "right"
    }

    // Check if the tile above is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(0, -1), tileSize) &&
      this.data.previousDirection !== 4 &&
      playerPosition.y > this.position.y
    ) {
      validDirectionsAwayFromPlayer.push(3); // Add direction "up"
    }

    // Check if the tile below is free and not the previous direction
    if (
      map.isTileFree(this.position, V2(0, 1), tileSize) &&
      this.data.previousDirection !== 3 &&
      playerPosition.y < this.position.y
    ) {
      validDirectionsAwayFromPlayer.push(4); // Add direction "down"
    }

    // If there are valid directions to move away from the player
    if (validDirectionsAwayFromPlayer.length > 0) {
      // Choose a random valid direction to move away from the player
      const randomDirectionIndex = Math.floor(Math.random() * validDirectionsAwayFromPlayer.length);
      this.data.randomDirection = validDirectionsAwayFromPlayer[randomDirectionIndex];
    } else {
      // If there are no valid directions to move away from the player,
      // simply choose a random direction to move (similar to the previous behavior)
      this.chooseRandomDirection();
    }
  }



  tick() {
    super.tick();

    const tileSize = 50;

    // Check if ghost is in the middle of a tile
    const isGhostMiddleOfTile = this.position.x % tileSize === 0 && this.position.y % tileSize === 0;

    // Rule #1 ghost is allowed to change direction only when it's in the middle of a tile
    if (isGhostMiddleOfTile) {
      const moveTowardsPlayer = Math.random() < 0.5; // 50% chance to move towards the player

      if (this.isScared) {
        this.moveAwayFromPlayer();
      } else {
        if (moveTowardsPlayer) {
          const validDirectionsTowardsPlayer = this.checkValidDirectionsTowardsPlayer();

          if (validDirectionsTowardsPlayer.length > 0) {
            const randomDirectionIndex = Math.floor(Math.random() * validDirectionsTowardsPlayer.length);
            this.data.randomDirection = validDirectionsTowardsPlayer[randomDirectionIndex];
          } else {
            this.chooseRandomDirection();
          }
        } else {
          this.chooseRandomDirection();
        }
      }
    }

    this.moveGhost();

    // Update previous direction
    this.data.previousDirection = this.data.randomDirection;
  }
}

export { Ghost };