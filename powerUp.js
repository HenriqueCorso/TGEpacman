import { Actor } from './engine/actor.js';
import { Engine } from './engine/engine.js';
import { Circle } from './engine/physics.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import * as TGE from './engine/engine.js';
import { stopAndHideFlipbook, playAndShowFlipbook } from './pacman-utils.js';

class PowerUp extends Actor {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/pellet.png',
      scale: 0.1,
      position: position,
      zIndex: 0,
    });

    this.setupColliders();
    this.setupCollisionResponse();
    this.setupOverlapEvent();
  }

  setupColliders() {
    const circlePowerUp = new Circle(V2(0, 0), 30);
    this.colliders.add(circlePowerUp);
    this.colliderType = 'Consumable';
  }

  setupCollisionResponse() {
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore,
    });
  }

  setupOverlapEvent() {
    this.events.add('beginoverlap', (e) => this.onPowerUpCollected());
  }

  onPowerUpCollected() {
    // Remove the power-up when the player overlaps with it
    this.destroy();
    console.log('PowerUp collected');

    // Set isScared flag to true for all ghosts
    const allGhosts = Engine.gameLoop.actors.filter((actor) => actor.name === 'ghost');
    allGhosts.forEach((ghost) => {
      if (ghost.data.isSpooked) {
        // If the ghost is already spooked (scared mode or disabled movement),
        // do not modify its scared state or timers.
        return;
      }

      ghost.isScared = true;
      stopAndHideFlipbook(ghost, 0);
      playAndShowFlipbook(ghost, 1, 'ScaredGhostMoving');

      // After 5 seconds, set isScared flag back to false for the ghost
      ghost.addTimer({
        duration: 120 * 5, // 5 seconds
        onComplete: (e) => {
          ghost.isScared = false;
          console.log('Ghost is back to normal');
          stopAndHideFlipbook(ghost, 1);
          playAndShowFlipbook(ghost, 0, 'GhostMoving');
        },
      });
    });
  }
}

export { PowerUp };
