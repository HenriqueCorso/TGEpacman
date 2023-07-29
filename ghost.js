import { Enemy } from './engine/enemy.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';
import { Flipbook } from './engine/flipbook.js';
import { stopAndHideFlipbook, playAndShowFlipbook } from './pacman-utils.js';

const GhostMovementOptions = {

  1: { vec: V2(1, 0), dir: 2 },  // Check if the tile to the left is free and not the previous direction
  2: { vec: V2(-1, 0), dir: 1 }, // Check if the tile to the right is free and not the previous direction
  3: { vec: V2(0, 1), dir: 4 }, // Check if the tile above is free and not the previous direction
  4: { vec: V2(0, -1), dir: 3 }, // Check if the tile below is free and not the previous direction

}

class Ghost extends Enemy {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      name: 'ghost',
      hasColliders: true,
      scale: 0.13,
      position: position,
    });
    this.spawnPosition = position.clone();
    this.timeSpooked = 0; // Variable to keep track of the time the ghost was spooked
  }

  init = async (flipbookName) => {
    const circleGhost = new Circle(V2(0, 0), 100);
    this.colliders.add(circleGhost);
    this.colliderType = 'Enemy';

    this.data.isScared = false; // New flag to indicate if the ghost is scared 
    this.data.isSpooked = false; // New flag to indicate if the ghost is spooked (movement disabled)

    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore,
    });
    this.events.add('beginoverlap', (e) => {
      if (this.isScared) {
        this.data.isSpooked = true;
        Engine.audio.spawn(`eatGhost`, true);

        console.log('Ghost moved to spawn position');

        Engine.gameLoop.addTimer({
          duration: 120 * 5, // 5 seconds
          onComplete: (e) => {
            this.data.isSpooked = false;
          },
        });

      } else {
        this.handleCollisionWithPacman();
      }
    });

    this.data.randomDirection = 0;
    this.data.previousDirection = 0;

    Engine.addActor(this);

    this.flags.isFlipbookEnabled = true;


    // ghost moving flipbook
    const ghostFB = new Flipbook({ dims: V2(3, 3), actor: this, fps: 8 });
    await ghostFB.loadAsAtlas(flipbookName);
    ghostFB.addSequence({ name: 'GhostMovingRight', startFrame: 0, endFrame: 1, loop: true });
    ghostFB.addSequence({ name: 'GhostMovingUp', startFrame: 2, endFrame: 3, loop: true });
    ghostFB.addSequence({ name: 'GhostMovingLeft', startFrame: 4, endFrame: 5, loop: true });
    ghostFB.addSequence({ name: 'GhostMovingDown', startFrame: 6, endFrame: 7, loop: true });
    ghostFB.addSequence({ name: 'GhostMoving', startFrame: 0, endFrame: 7, loop: true });

    // ghost1 scared flipbook
    const ghostFBS = new Flipbook({ dims: V2(3, 3), actor: this, fps: 8 });
    await ghostFBS.loadAsAtlas('img/ghostMovingScared.png');
    ghostFBS.addSequence({ name: 'ScaredGhostMoving', startFrame: 0, endFrame: 7, loop: true });
  };

  handleCollisionWithPacman() {
    const player = Engine.gameLoop.findActorByName('pacman');
    player.rotation = 0

    Engine.audio.spawn(`pacmanDeath`, true);


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
      this.position.x -= 1; //left
      playAndShowFlipbook(this, 0, 'GhostMovingLeft')

    } else if (this.data.randomDirection === 2) {
      this.position.x += 1; //right
      playAndShowFlipbook(this, 0, 'GhostMovingRight')

    } else if (this.data.randomDirection === 3) {
      this.position.y -= 1;//up
      playAndShowFlipbook(this, 0, 'GhostMovingUp')

    } else if (this.data.randomDirection === 4) {
      this.position.y += 1;//down
      playAndShowFlipbook(this, 0, 'GhostMovingDown')

    }
  }

  getValidDirections(map, tileSize) {
    let result = [];
    for (const [k, v] of Object.entries(GhostMovementOptions)) {
      if (map.isTileFree(this.position, v.vec, tileSize) && this.data.previousDirection != k) result.push(v.dir);
    }
    return result;
  }

  chooseDirection(behavior) {
    const map = this.owner.data.map;
    const tileSize = this.owner.data.tileSize;

    const player = Engine.gameLoop.findActorByName('pacman');
    const playerPosition = player.position;

    let validDirections = this.getValidDirections(map, tileSize);


    // Choose a random valid direction from all available directions
    if (behavior === 'random') {
      const randomDirectionIndex = Math.floor(Math.random() * validDirections.length);
      this.data.randomDirection = validDirections[randomDirectionIndex];

      // Choose a valid direction away from the player
    } else if (behavior === 'awayFromPlayer') {
      const validDirectionsAwayFromPlayer = validDirections.filter((dir) => {
        if (dir === 1 && playerPosition.x > this.position.x) return true;
        if (dir === 2 && playerPosition.x < this.position.x) return true;
        if (dir === 3 && playerPosition.y > this.position.y) return true;
        if (dir === 4 && playerPosition.y < this.position.y) return true;
        return false;
      });

      if (validDirectionsAwayFromPlayer.length > 0) {
        validDirections = validDirectionsAwayFromPlayer;
      }
      // Choose a valid direction toeward the player
    } else if (behavior === 'towardsPlayer') {
      const validDirectionsTowardsPlayer = validDirections.filter((dir) => {
        if (dir === 1 && playerPosition.x < this.position.x) return true;
        if (dir === 2 && playerPosition.x > this.position.x) return true;
        if (dir === 3 && playerPosition.y < this.position.y) return true;
        if (dir === 4 && playerPosition.y > this.position.y) return true;
        return false;
      });

      if (validDirectionsTowardsPlayer.length > 0) {
        validDirections = validDirectionsTowardsPlayer;
      }
    } else if (behavior === 'moveToSpawnPosition') {
      // Move towards the spawn position of the ghost
      const stepsPerTick = this.data.isSpooked ? 2 : 1; // Increase the steps per tick when spooked

      for (let i = 0; i < stepsPerTick; i++) {
        const currentPosition = this.position.clone();
        const targetPosition = this.spawnPosition.clone();

        // Calculate the difference between the current position and the target position
        const diffX = targetPosition.x - currentPosition.x;
        const diffY = targetPosition.y - currentPosition.y;

        // Check if the ghost is already close to the target position
        if (Math.abs(diffX) < tileSize / 2 && Math.abs(diffY) < tileSize / 2) {
          // If the ghost is close enough, snap it to the target position
          this.position = targetPosition.clone();
          return;
        }

        // Otherwise, move the ghost towards the target position
        if (Math.abs(diffX) > Math.abs(diffY)) {
          // Move horizontally first
          this.position.x += diffX > 0 ? 1 : -1;
        } else {
          // Move vertically first
          this.position.y += diffY > 0 ? 1 : -1;
        }
      }
    }

    // Choose a random valid direction (if not already chosen in the 'random' behavior)
    if (this.data.randomDirection === undefined || behavior !== 'random') {
      const randomDirectionIndex = Math.floor(Math.random() * validDirections.length);
      this.data.randomDirection = validDirections[randomDirectionIndex];
    }

    // Update previous direction
    this.data.previousDirection = this.data.randomDirection;
  }


  tick() {
    super.tick();

    if (this.data.isSpooked) {
      // If the ghost is spooked, move it quickly to the spawn position
      this.chooseDirection('moveToSpawnPosition');
      return;
    }

    const tileSize = this.owner.data.tileSize;

    // Check if ghost is in the middle of a tile
    const isGhostMiddleOfTile = this.position.x % tileSize === 0 && this.position.y % tileSize === 0;

    // Rule #1 ghost is allowed to change direction only when it's in the middle of a tile
    if (isGhostMiddleOfTile) {
      const moveTowardsPlayer = Math.random() < 0.6; // 60% chance to move towards the player

      if (this.isScared) {
        this.chooseDirection('awayFromPlayer');
      } else {
        if (moveTowardsPlayer) {
          this.chooseDirection('towardsPlayer');
        } else {
          this.chooseDirection('random');
        }
      }
    }

    this.moveGhost();
  }
}

export { Ghost }; 