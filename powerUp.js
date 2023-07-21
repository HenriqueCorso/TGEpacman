import { Actor } from './engine/actor.js';
import { Player, Enum_PlayerMovement } from './engine/player.js';
import { Engine } from './engine/engine.js';
import { Vector2 as Vec2, V2 } from './engine/types.js';
import { Box, Circle, Poly } from './engine/physics.js';
import * as TGE from './engine/engine.js';


class PowerUp extends Actor {
  constructor(position) {
    super({
      owner: Engine.gameLoop,
      hasColliders: true,
      imgUrl: 'img/pellet.png',
      scale: 0.1,
      position: position,
      zIndex: 0
    });
    // Create collision circle for the pellet
    const circlePowerUp = new Circle(V2(0, 0), 30);

    this.colliders.add(circlePowerUp);
    this.colliderType = 'Consumable';
    this.setCollisionResponseFlag({
      Consumable: TGE.Enum_HitTestMode.Ignore,
      Enemy: TGE.Enum_HitTestMode.Ignore,
      Player: TGE.Enum_HitTestMode.Overlap,
      Obstacle: TGE.Enum_HitTestMode.Ignore
    });
    this.events.add('beginoverlap', e => {
      // Remove the pellet when the player overlaps with it
      this.destroy();
      console.log('PowerUp collected');

      // Set isScared flag to true for all ghosts
      const allGhosts = Engine.gameLoop.actors.filter(actor => actor.name === 'ghost');
      allGhosts.forEach(ghost => {
        ghost.isScared = true;

        // Stop the current flipbook (if any) for the ghost
        ghost.flipbooks[0].stop();


        // Play the new flipbook representing the scared state
        ghost.flipbooks[1].play('ScaredGhostMoving');
      });

      // After 5 seconds, set isScared flag back to false for all ghosts
      allGhosts.forEach(ghost => {
        ghost.addTimer({
          duration: 120 * 5,         // 5 seconds
          onComplete: e => {
            ghost.isScared = false;
            console.log('Ghosts are back to normal');

            // Stop the current flipbook (if any) for the ghost
            ghost.flipbooks[1].stop();

            // Play the original flipbook representing the normal state
            ghost.flipbooks[0].play('GhostMoving');
          }
        });
      });
    });
  }
}



export { PowerUp };
