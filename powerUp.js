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
    Engine.audio.tracks['powerUp'].instances.forEach((sfx) => sfx.stop());

    this.destroy();
    console.log('PowerUp collected');
    Engine.gameLoop.data.ghostHunt = 120 * 5; // 60 * 5 frames = 5 seconds

    // Set isScared flag to true for all ghosts
    const allGhosts = Engine.gameLoop.actors.filter((actor) => actor.name === 'ghost');
    allGhosts.forEach((ghost) => {
      if (ghost.data.isSpooked) {
        // If the ghost is already spooked (scared mode or disabled movement),
        // do not modify its scared state or timers.
        return;
      }

      if (Engine.gameLoop.data.ghostHunt > 0) {
        // Add the logic for scared behavior here

        Engine.audio.spawn(`powerUp`, { loop: true });
        ghost.isScared = true;
        stopAndHideFlipbook(ghost, 0);
        playAndShowFlipbook(ghost, 1, 'ScaredGhostMoving');

      }
    })
  }
}

export { PowerUp };